const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../utils/upload');
const { uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');

// Helper: Check if user is blocked by the other user
async function isBlockedByOther(userId, otherUserId) {
    const block = await prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: otherUserId, blockedId: userId } },
    });
    return !!block;
}

// Start a DM chat with a user
router.post('/start/:userId', authenticate, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const { source } = req.body; // RISHTA or GENERAL
        if (otherUserId === req.user.id) {
            return res.status(400).json({ error: 'Cannot start chat with yourself' });
        }

        // Check blocks
        const blocked = await prisma.block.findFirst({
            where: {
                OR: [
                    { blockerId: req.user.id, blockedId: otherUserId },
                    { blockerId: otherUserId, blockedId: req.user.id },
                ],
            },
        });
        if (blocked) return res.status(403).json({ error: 'Chat blocked' });

        // Check if chat already exists (either direction)
        const existing = await prisma.dMChat.findFirst({
            where: {
                OR: [
                    { user1Id: req.user.id, user2Id: otherUserId },
                    { user1Id: otherUserId, user2Id: req.user.id },
                ],
            },
            include: {
                user1: { select: { id: true, name: true, photoUrl: true } },
                user2: { select: { id: true, name: true, photoUrl: true } },
            },
        });

        if (existing) return res.json(existing);

        const chat = await prisma.dMChat.create({
            data: {
                user1Id: req.user.id,
                user2Id: otherUserId,
                source: source || 'GENERAL',
            },
            include: {
                user1: { select: { id: true, name: true, photoUrl: true } },
                user2: { select: { id: true, name: true, photoUrl: true } },
            },
        });

        res.status(201).json(chat);
    } catch (error) {
        console.error('Start DM error:', error);
        res.status(500).json({ error: 'Failed to start chat' });
    }
});

// Get all DM chats for current user
router.get('/chats', authenticate, async (req, res) => {
    try {
        const chats = await prisma.dMChat.findMany({
            where: {
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
                isBlocked: false,
            },
            include: {
                user1: { select: { id: true, name: true, photoUrl: true } },
                user2: { select: { id: true, name: true, photoUrl: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { text: true, images: true, createdAt: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        res.json({ chats });
    } catch (error) {
        console.error('Get DM chats error:', error);
        res.status(500).json({ error: 'Failed to get chats' });
    }
});

// Get messages in a DM chat
router.get('/:chatId/messages', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Verify user is part of this chat
        const chat = await prisma.dMChat.findFirst({
            where: {
                id: req.params.chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
            },
        });
        if (!chat) return res.status(403).json({ error: 'Access denied' });

        const messages = await prisma.dMMessage.findMany({
            where: { chatId: req.params.chatId },
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, photoUrl: true } },
            },
        });

        res.json({ messages: messages.reverse() });
    } catch (error) {
        console.error('Get DM messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});

// Send DM message (text + optional images)
router.post('/:chatId/messages', authenticate, async (req, res) => {
    try {
        const { text, images = [] } = req.body;

        if (!text && images.length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Check if user is blocked globally
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user.isBlocked) {
            return res.status(403).json({ error: 'Your account has been blocked' });
        }

        // Verify user is part of this chat
        const chat = await prisma.dMChat.findFirst({
            where: {
                id: req.params.chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
            },
        });
        if (!chat) return res.status(403).json({ error: 'Access denied' });
        if (chat.isBlocked) return res.status(403).json({ error: 'This chat has been blocked' });

        // Check if blocked by other user
        const otherUserId = chat.user1Id === req.user.id ? chat.user2Id : chat.user1Id;
        const blocked = await prisma.block.findFirst({
            where: {
                OR: [
                    { blockerId: req.user.id, blockedId: otherUserId },
                    { blockerId: otherUserId, blockedId: req.user.id },
                ],
            },
        });
        if (blocked) return res.status(403).json({ error: 'Chat blocked' });

        const message = await prisma.dMMessage.create({
            data: {
                chatId: req.params.chatId,
                senderId: req.user.id,
                text: text || null,
                images,
            },
            include: {
                sender: { select: { id: true, name: true, photoUrl: true } },
            },
        });

        // Update chat timestamp
        await prisma.dMChat.update({
            where: { id: req.params.chatId },
            data: { updatedAt: new Date() },
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Send DM message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Upload images for DM (returns URLs to then send in message)
router.post('/:chatId/upload', authenticate, upload.array('images', 3), async (req, res) => {
    try {
        // Verify user is part of this chat
        const chat = await prisma.dMChat.findFirst({
            where: {
                id: req.params.chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
            },
        });
        if (!chat) return res.status(403).json({ error: 'Access denied' });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images provided' });
        }

        const imageUrls = await uploadMultipleToCloudinary(req.files, 'dm/images');
        res.json({ images: imageUrls });
    } catch (error) {
        console.error('DM image upload error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

// Block a user in DM
router.post('/:chatId/block', authenticate, async (req, res) => {
    try {
        const chat = await prisma.dMChat.findFirst({
            where: {
                id: req.params.chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
            },
        });
        if (!chat) return res.status(403).json({ error: 'Access denied' });

        const otherUserId = chat.user1Id === req.user.id ? chat.user2Id : chat.user1Id;

        // Check if already blocked
        const existing = await prisma.block.findUnique({
            where: { blockerId_blockedId: { blockerId: req.user.id, blockedId: otherUserId } },
        });
        if (existing) {
            return res.json({ message: 'User already blocked' });
        }

        await prisma.block.create({
            data: { blockerId: req.user.id, blockedId: otherUserId },
        });

        res.json({ message: 'User blocked successfully. You will no longer receive messages from them.' });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
});

// Unblock a user
router.post('/:chatId/unblock', authenticate, async (req, res) => {
    try {
        const chat = await prisma.dMChat.findFirst({
            where: {
                id: req.params.chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
            },
        });
        if (!chat) return res.status(403).json({ error: 'Access denied' });

        const otherUserId = chat.user1Id === req.user.id ? chat.user2Id : chat.user1Id;

        await prisma.block.deleteMany({
            where: { blockerId: req.user.id, blockedId: otherUserId },
        });

        res.json({ message: 'User unblocked' });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
});

// Report in DM
router.post('/:chatId/report', authenticate, async (req, res) => {
    try {
        const { messageId, reason } = req.body;

        const chat = await prisma.dMChat.findFirst({
            where: {
                id: req.params.chatId,
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
            },
        });
        if (!chat) return res.status(403).json({ error: 'Access denied' });

        const otherUserId = chat.user1Id === req.user.id ? chat.user2Id : chat.user1Id;

        await prisma.report.create({
            data: {
                reporterUserId: req.user.id,
                targetUserId: messageId ? (await prisma.dMMessage.findUnique({ where: { id: messageId } }))?.senderId || otherUserId : otherUserId,
                targetType: messageId ? 'DM_MESSAGE' : 'DM_USER',
                targetId: messageId || req.params.chatId,
                reason: reason || 'Vulgar/inappropriate language',
            },
        });

        res.json({ message: 'Report submitted. Our admins will review it.' });
    } catch (error) {
        console.error('DM Report error:', error);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

module.exports = router;
