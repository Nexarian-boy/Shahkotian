const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const prisma = require('../config/database');
const exceljs = require('exceljs');
const { authenticate, adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Helper: upload buffer to Cloudinary
async function uploadToCloudinary(buffer, folder, resourceType = 'image') {
  try {
    const cloudinaryModule = require('../config/cloudinary');
    const cloudinary = cloudinaryModule.default || cloudinaryModule;
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, quality: 'auto:good' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
}

// ── AC Officer Auth Middleware ──────────────────────────────────────────
async function acAuth(req, res, next) {
  try {
    const token = req.headers['x-ac-token'] || req.query.token;
    if (!token) return res.status(401).json({ error: 'AC authentication required.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'AC_OFFICER') return res.status(403).json({ error: 'Invalid AC token.' });
    const officer = await prisma.aCOfficer.findUnique({ where: { id: decoded.officerId } });
    if (!officer || !officer.isActive) return res.status(403).json({ error: 'AC account not found or deactivated.' });
    req.acOfficer = officer;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired AC token.' });
  }
}

// ══════════════════════════════════════════════════════════════════════════
// AC OFFICER AUTH
// ══════════════════════════════════════════════════════════════════════════

// POST /ac/auth/login — AC officer login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const officer = await prisma.aCOfficer.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!officer) return res.status(401).json({ error: 'Invalid credentials.' });
    if (!officer.isActive) return res.status(403).json({ error: 'Account is deactivated.' });

    const valid = await bcrypt.compare(password, officer.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ officerId: officer.id, role: 'AC_OFFICER' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      officer: { id: officer.id, name: officer.name, email: officer.email, designation: officer.designation },
    });
  } catch (error) {
    console.error('AC login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN: MANAGE AC OFFICERS
// ══════════════════════════════════════════════════════════════════════════

// POST /ac/admin/officer/create — Create AC officer account
router.post('/admin/officer/create', authenticate, adminOnly, async (req, res) => {
  try {
    const { email, password, name, designation } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name required.' });

    const existing = await prisma.aCOfficer.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return res.status(400).json({ error: 'AC officer with this email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const officer = await prisma.aCOfficer.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashed,
        name: name.trim(),
        designation: designation || 'Assistant Commissioner',
      },
    });

    res.json({ message: 'AC officer created.', officer: { id: officer.id, email: officer.email, name: officer.name, designation: officer.designation } });
  } catch (error) {
    console.error('Create AC error:', error);
    res.status(500).json({ error: 'Failed to create AC officer.' });
  }
});

// GET /ac/admin/officers — List AC officers
router.get('/admin/officers', authenticate, adminOnly, async (req, res) => {
  try {
    const officers = await prisma.aCOfficer.findMany({
      select: { id: true, email: true, name: true, designation: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ officers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch officers.' });
  }
});

// DELETE /ac/admin/officer/:id — Delete AC officer
router.delete('/admin/officer/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.aCOfficer.delete({ where: { id: req.params.id } });
    res.json({ message: 'AC officer deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete officer.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN: CNIC VERIFICATION
// ══════════════════════════════════════════════════════════════════════════

// GET /ac/admin/pending-cnic — List pending CNIC verifications
router.get('/admin/pending-cnic', authenticate, adminOnly, async (req, res) => {
  try {
    const complainants = await prisma.aCComplainant.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ complainants });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending verifications.' });
  }
});

// GET /ac/admin/all-complainants — List all complainants
router.get('/admin/all-complainants', authenticate, adminOnly, async (req, res) => {
  try {
    const complainants = await prisma.aCComplainant.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ complainants });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complainants.' });
  }
});

// PUT /ac/admin/cnic/:id/approve
router.put('/admin/cnic/:id/approve', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.aCComplainant.update({
      where: { id: req.params.id },
      data: { verificationStatus: 'APPROVED' },
    });
    res.json({ message: 'CNIC approved.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve.' });
  }
});

// PUT /ac/admin/cnic/:id/reject
router.put('/admin/cnic/:id/reject', authenticate, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    await prisma.aCComplainant.update({
      where: { id: req.params.id },
      data: { verificationStatus: 'REJECTED', rejectionReason: reason || 'CNIC verification failed.' },
    });
    res.json({ message: 'CNIC rejected.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject.' });
  }
});

// GET /ac/admin/export — Export Excel of all complainants + complaints
router.get('/admin/export', authenticate, adminOnly, async (req, res) => {
  try {
    const complainants = await prisma.aCComplainant.findMany({
      include: {
        user: { select: { name: true, email: true } },
        complaints: { select: { id: true, title: true, status: true, rating: true, createdAt: true, resolvedAt: true } },
      },
    });

    // Build CSV
    let csv = 'Name,Email,Phone,CNIC Number,Verification Status,CNIC Front URL,CNIC Back URL,Total Complaints,Avg Rating\n';
    complainants.forEach(c => {
      const avgRating = c.complaints.filter(x => x.rating).reduce((a, x) => a + x.rating, 0) / (c.complaints.filter(x => x.rating).length || 1);
      csv += `"${c.user?.name || ''}","${c.user?.email || ''}","${c.phone}","${c.cnicNumber || ''}","${c.verificationStatus}","${c.cnicFront}","${c.cnicBack}",${c.complaints.length},${avgRating.toFixed(1)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ac_complainants_data.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data.' });
  }
});

// POST /ac/admin/announcements — Admin creates announcement
router.post('/admin/announcements', authenticate, adminOnly, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required.' });
    const announcement = await prisma.aCAnnouncement.create({ data: { title, content } });
    res.json({ message: 'Announcement created.', announcement });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// USER: COMPLAINANT IDENTITY VERIFICATION
// ══════════════════════════════════════════════════════════════════════════

// POST /ac/complainant/verify — Upload CNIC + phone (first time)
router.post('/complainant/verify', authenticate, upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, cnicNumber } = req.body;

    if (!phone) return res.status(400).json({ error: 'Phone number is required.' });
    if (!req.files?.cnicFront?.[0] || !req.files?.cnicBack?.[0]) {
      return res.status(400).json({ error: 'Both CNIC front and back images are required.' });
    }

    // Check if already submitted
    const existing = await prisma.aCComplainant.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ error: 'CNIC already submitted.', status: existing.verificationStatus });
    }

    // Upload images to Cloudinary
    const [frontUrl, backUrl] = await Promise.all([
      uploadToCloudinary(req.files.cnicFront[0].buffer, 'ac-cnic'),
      uploadToCloudinary(req.files.cnicBack[0].buffer, 'ac-cnic'),
    ]);

    const complainant = await prisma.aCComplainant.create({
      data: {
        userId,
        cnicFront: frontUrl,
        cnicBack: backUrl,
        phone: phone.trim(),
        cnicNumber: cnicNumber?.trim() || null,
      },
    });

    res.json({ message: 'CNIC submitted for verification.', complainant: { id: complainant.id, verificationStatus: complainant.verificationStatus } });
  } catch (error) {
    console.error('CNIC verification error:', error);
    res.status(500).json({ error: 'Failed to submit CNIC.' });
  }
});

// GET /ac/complainant/status — Check verification status
router.get('/complainant/status', authenticate, async (req, res) => {
  try {
    const complainant = await prisma.aCComplainant.findUnique({
      where: { userId: req.user.id },
      select: { id: true, verificationStatus: true, rejectionReason: true, phone: true, cnicNumber: true },
    });
    if (!complainant) return res.json({ status: 'NOT_SUBMITTED' });
    res.json({ status: complainant.verificationStatus, complainant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check status.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// USER: COMPLAINTS
// ══════════════════════════════════════════════════════════════════════════

// POST /ac/complaints — Submit a complaint
router.post('/complaints', authenticate, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
  { name: 'voice', maxCount: 1 },
]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, voiceDuration } = req.body;

    if (!title) return res.status(400).json({ error: 'Complaint title is required.' });

    // Check CNIC approval
    const complainant = await prisma.aCComplainant.findUnique({ where: { userId } });
    if (!complainant || complainant.verificationStatus !== 'APPROVED') {
      return res.status(403).json({ error: 'CNIC verification required before submitting complaints.' });
    }

    // Upload attachments
    const attachments = [];

    if (description) {
      attachments.push({ type: 'TEXT', url: description });
    }

    if (req.files?.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.buffer, 'ac-complaints');
        attachments.push({ type: 'IMAGE', url });
      }
    }

    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const url = await uploadToCloudinary(file.buffer, 'ac-complaints', 'video');
        attachments.push({ type: 'VIDEO', url });
      }
    }

    if (req.files?.voice?.[0]) {
      const url = await uploadToCloudinary(req.files.voice[0].buffer, 'ac-complaints', 'video');
      attachments.push({ type: 'VOICE', url, voiceDuration: parseInt(voiceDuration) || null });
    }

    const complaint = await prisma.aCComplaint.create({
      data: {
        complainantId: complainant.id,
        title: title.trim(),
        description: description?.trim() || null,
        attachments: { create: attachments },
      },
      include: { attachments: true },
    });

    res.json({ message: 'Complaint submitted.', complaint });
  } catch (error) {
    console.error('Complaint submit error:', error);
    res.status(500).json({ error: 'Failed to submit complaint.' });
  }
});

// GET /ac/complaints/mine — User's own complaints
router.get('/complaints/mine', authenticate, async (req, res) => {
  try {
    const complainant = await prisma.aCComplainant.findUnique({ where: { userId: req.user.id } });
    if (!complainant) return res.json({ complaints: [], stats: { total: 0, pending: 0, working: 0, solved: 0 } });

    const complaints = await prisma.aCComplaint.findMany({
      where: { complainantId: complainant.id },
      include: { attachments: true },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'NEW').length,
      working: complaints.filter(c => c.status === 'WORKING').length,
      solved: complaints.filter(c => c.status === 'SOLVED').length,
    };

    res.json({ complaints, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints.' });
  }
});

// POST /ac/complaints/:id/rate — User rates resolved complaint
router.post('/complaints/:id/rate', authenticate, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5.' });

    const complaint = await prisma.aCComplaint.findUnique({
      where: { id: req.params.id },
      include: { complainant: true },
    });

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (complaint.complainant.userId !== req.user.id) return res.status(403).json({ error: 'Not your complaint.' });
    if (complaint.status !== 'SOLVED') return res.status(400).json({ error: 'Can only rate solved complaints.' });
    if (complaint.rating) return res.status(400).json({ error: 'Already rated.' });

    await prisma.aCComplaint.update({
      where: { id: req.params.id },
      data: { rating: parseInt(rating) },
    });

    res.json({ message: 'Thank you for rating!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENTS (PUBLIC)
// ══════════════════════════════════════════════════════════════════════════

// GET /ac/announcements — List published announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await prisma.aCAnnouncement.findMany({
      where: { isPublished: true },
      include: { officer: { select: { name: true, designation: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// AC OFFICER DASHBOARD
// ══════════════════════════════════════════════════════════════════════════

// GET /ac/dashboard — AC dashboard stats + complaints
router.get('/dashboard', acAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalNew, totalWorking, totalSolved, allComplaints] = await Promise.all([
      prisma.aCComplaint.count({ where: { status: 'NEW', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.aCComplaint.count({ where: { status: 'WORKING', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.aCComplaint.count({ where: { status: 'SOLVED', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.aCComplaint.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        include: {
          complainant: {
            include: { user: { select: { name: true } } },
          },
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calculate avg rating from solved complaints with ratings
    const ratedComplaints = allComplaints.filter(c => c.rating);
    const avgRating = ratedComplaints.length > 0
      ? (ratedComplaints.reduce((s, c) => s + c.rating, 0) / ratedComplaints.length).toFixed(1)
      : '0.0';

    // Rating breakdown: each complainer's rating
    const ratings = ratedComplaints.map(c => ({
      complaintId: c.id,
      title: c.title,
      rating: c.rating,
      complainantName: c.complainant?.user?.name || 'Unknown',
      resolvedAt: c.resolvedAt,
    }));

    res.json({
      stats: { new: totalNew, working: totalWorking, solved: totalSolved, avgRating: parseFloat(avgRating) },
      complaints: allComplaints,
      ratings,
    });
  } catch (error) {
    console.error('AC dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
});

// GET /ac/complaints/:id — AC views single complaint detail
router.get('/complaints/:id/detail', acAuth, async (req, res) => {
  try {
    const complaint = await prisma.aCComplaint.findUnique({
      where: { id: req.params.id },
      include: {
        complainant: {
          include: { user: { select: { name: true, email: true } } },
        },
        attachments: true,
      },
    });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaint.' });
  }
});

// PUT /ac/complaints/:id/status — AC updates complaint status
router.put('/complaints/:id/status', acAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['WORKING', 'SOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be WORKING or SOLVED.' });
    }

    const data = { status };
    if (status === 'SOLVED') data.resolvedAt = new Date();

    await prisma.aCComplaint.update({ where: { id: req.params.id }, data });
    res.json({ message: `Complaint marked as ${status}.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// POST /ac/announcements/create — AC creates announcement with media
router.post('/announcements/create', acAuth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
  { name: 'voice', maxCount: 1 },
]), async (req, res) => {
  try {
    const { title, content, voiceDuration } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required.' });

    const folder = `shahkot/ac_announcements`;
    const imageUploads = req.files?.images?.map(f => uploadToCloudinary(f.buffer, folder, 'image')) || [];
    const videoUploads = req.files?.videos?.map(f => uploadToCloudinary(f.buffer, folder, 'video')) || [];
    // Note: Audio files are uploaded as video resource type in Cloudinary
    const voiceUpload = req.files?.voice?.[0] ? uploadToCloudinary(req.files.voice[0].buffer, folder, 'video') : Promise.resolve(null);

    const [imageUrls, videoUrls, voiceUrl] = await Promise.all([
      Promise.all(imageUploads),
      Promise.all(videoUploads),
      voiceUpload,
    ]);

    const announcement = await prisma.aCAnnouncement.create({
      data: {
        title,
        content: content || '',
        officer: { connect: { id: req.acOfficer.id } },
        images: imageUrls,
        videos: videoUrls,
        voice: voiceUrl,
        voiceDuration: voiceDuration ? parseInt(voiceDuration) : null,
      },
    });
    res.json({ message: 'Announcement created.', announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

// DELETE /ac/announcements/:id — AC deletes announcement
router.delete('/announcements/:id', acAuth, async (req, res) => {
  try {
    const existing = await prisma.aCAnnouncement.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Announcement not found.' });

    await prisma.aCAnnouncement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Announcement deleted.' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement.' });
  }
});

// POST /ac/announcements/:id/view — Increment view count
router.post('/announcements/:id/view', async (req, res) => {
  try {
    await prisma.aCAnnouncement.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// POST /ac/announcements/:id/like — Toggle user like
router.post('/announcements/:id/like', authenticate, async (req, res) => {
  try {
    const announcement = await prisma.aCAnnouncement.findUnique({ where: { id: req.params.id } });
    if (!announcement) return res.status(404).json({ error: 'Not found' });
    
    let likedBy = announcement.likedBy || [];
    const userId = req.user.id;
    const hasLiked = likedBy.includes(userId);
    
    if (hasLiked) {
      likedBy = likedBy.filter(id => id !== userId);
    } else {
      likedBy.push(userId);
    }
    
    const updated = await prisma.aCAnnouncement.update({
      where: { id: req.params.id },
      data: { likedBy, likes: likedBy.length },
    });
    
    res.json({ likes: updated.likes, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// GET /ac/export — AC downloads Excel (.xlsx) report
router.get('/export', acAuth, async (req, res) => {
  try {
    const complaints = await prisma.aCComplaint.findMany({
      include: {
        complainant: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Complaints');

    worksheet.columns = [
      { header: 'Complainant', key: 'complainant', width: 25 },
      { header: 'CNIC Number', key: 'cnicNumber', width: 22 },
      { header: 'Phone Number', key: 'phone', width: 18 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Submitted Date', key: 'submitted', width: 20 },
      { header: 'Resolved Date', key: 'resolved', width: 20 },
      { header: 'Rating', key: 'rating', width: 10 },
    ];

    complaints.forEach(c => {
      worksheet.addRow({
        complainant: c.complainant?.user?.name || 'Unknown',
        cnicNumber: c.complainant?.cnicNumber || '-',
        phone: c.complainant?.phone || '-',
        title: c.title,
        status: c.status,
        submitted: new Date(c.createdAt).toLocaleDateString('en-PK'),
        resolved: c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString('en-PK') : '-',
        rating: c.rating || '-',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ac_complaints_report.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export report.' });
  }
});

module.exports = router;
