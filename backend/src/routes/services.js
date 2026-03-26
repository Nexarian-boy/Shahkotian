const express = require('express');
const prisma = require('../config/database');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadCNIC } = require('../utils/upload');
const { uploadImageFile } = require('../utils/imageUpload');
const { sendPushToUser } = require('../utils/pushNotification');

const router = express.Router();

const INITIAL_CATEGORIES = [
  {
    name: 'گھریلو مرمت اور ٹیکنیکل سروسز', emoji: '🔧',
    subs: ['الیکٹریشن', 'پلمبر', 'AC / فریج مکینک', 'واشنگ مشین ریپئر', 'UPS / سولر سسٹم ٹیکنیشن', 'CCTV کیمرہ انسٹالیشن', 'موبائل اور لیپ ٹاپ ریپئر'],
  },
  {
    name: 'ہوم مینٹیننس اور صفائی', emoji: '🏠',
    subs: ['ڈیپ کلیننگ', 'کارپینٹر', 'پینٹر', 'ماربل / ٹائل پالش', 'واٹر ٹینک کلیننگ', 'Mistri', 'Mazdoor', 'Thaikydar'],
  },
  {
    name: 'لکڑی کا کام', emoji: '🪵',
    subs: ['Door Fitting', 'فرنیچر بنانا', 'کھڑکی فریم', 'Cabinet Work', 'Other Woodwork'],
  },
  {
    name: 'تعلیم اور سکل سروسز', emoji: '👨‍🏫',
    subs: ['ہوم ٹیوشن (تمام کلاسز)', 'قرآن ٹیچر', 'کمپیوٹر / فری لانسنگ ٹریننگ', 'بیوٹی پارلر ہوم سروس'],
  },
  {
    name: 'روزمرہ سہولیات', emoji: '🚗',
    subs: ['ڈرائیور آن کال', 'ہوم ڈلیوری', 'بزرگوں کی دیکھ بھال', 'بچوں کی بیبی سٹنگ'],
  },
  {
    name: 'اسپیشل سروسز', emoji: '⭐',
    subs: ['میڈیا کوریج', 'ایونٹ مینجمنٹ', 'فوٹوگرافر / ویڈیوگرافر', 'ہوم فوڈ / ٹفن سروس', 'لانڈری / استری سروس', 'سیکورٹی گارڈ'],
  },
];

async function seedInitialCategories() {
  try {
    const count = await prisma.serviceCategory.count();
    if (count > 0) return;

    for (const cat of INITIAL_CATEGORIES) {
      await prisma.serviceCategory.create({
        data: {
          name: cat.name,
          emoji: cat.emoji,
          subCategories: {
            create: cat.subs.map((name) => ({ name })),
          },
        },
      });
    }
  } catch (error) {
    console.error('Service categories seed error:', error.message);
  }
}

seedInitialCategories();

// Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({ error: 'Failed to load categories.' });
  }
});

router.get('/categories/:id/sub', async (req, res) => {
  try {
    const subCategories = await prisma.serviceSubCategory.findMany({
      where: {
        categoryId: req.params.id,
        isActive: true,
        category: { isActive: true },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ subCategories });
  } catch (error) {
    console.error('Get service sub-categories error:', error);
    res.status(500).json({ error: 'Failed to load sub-categories.' });
  }
});

router.get('/providers', async (req, res) => {
  try {
    const { subCategoryId, categoryId } = req.query;
    const where = {
      status: 'APPROVED',
      category: { isActive: true },
      subCategory: { isActive: true },
    };

    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (categoryId) where.categoryId = categoryId;

    const providers = await prisma.serviceProvider.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, photoUrl: true } },
        category: { select: { id: true, name: true, emoji: true } },
        subCategory: { select: { id: true, name: true } },
        reviews: { select: { stars: true } },
      },
    });

    const mapped = providers.map((p) => {
      const count = p.reviews.length;
      const avgStars = count > 0 ? Number((p.reviews.reduce((s, r) => s + r.stars, 0) / count).toFixed(2)) : 0;
      return {
        ...p,
        avgStars,
        reviewsCount: count,
        reviews: undefined,
      };
    });

    res.json({ providers: mapped });
  } catch (error) {
    console.error('Get service providers error:', error);
    res.status(500).json({ error: 'Failed to load providers.' });
  }
});

router.get('/providers/:id', async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, phone: true, photoUrl: true } },
        category: { select: { id: true, name: true, emoji: true } },
        subCategory: { select: { id: true, name: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { seeker: { select: { id: true, name: true, photoUrl: true } } },
        },
      },
    });

    if (!provider || provider.status !== 'APPROVED') {
      return res.status(404).json({ error: 'Provider not found.' });
    }

    const reviewsCount = provider.reviews.length;
    const avgStars = reviewsCount > 0 ? Number((provider.reviews.reduce((s, r) => s + r.stars, 0) / reviewsCount).toFixed(2)) : 0;

    res.json({ provider: { ...provider, avgStars, reviewsCount } });
  } catch (error) {
    console.error('Get provider detail error:', error);
    res.status(500).json({ error: 'Failed to load provider details.' });
  }
});

router.get('/my-provider', authenticate, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: req.user.id },
      include: {
        category: { select: { id: true, name: true, emoji: true } },
        subCategory: { select: { id: true, name: true } },
      },
    });

    res.json({ provider });
  } catch (error) {
    console.error('Get my provider status error:', error);
    res.status(500).json({ error: 'Failed to load provider status.' });
  }
});

router.post('/register-provider', authenticate, uploadCNIC, async (req, res) => {
  try {
    const { categoryId, subCategoryId, experience, phone, description } = req.body;

    if (!categoryId || !subCategoryId || !experience || !phone) {
      return res.status(400).json({ error: 'Category, sub-category, experience, and phone are required.' });
    }

    const parsedExp = parseInt(experience, 10);
    if (!Number.isInteger(parsedExp) || parsedExp < 0 || parsedExp > 60) {
      return res.status(400).json({ error: 'Experience must be between 0 and 60 years.' });
    }

    const cnicFrontFile = req.files?.cnicFront?.[0];
    const cnicBackFile = req.files?.cnicBack?.[0];

    if (!cnicFrontFile || !cnicBackFile) {
      return res.status(400).json({ error: 'CNIC front and back images are required.' });
    }

    const subCategory = await prisma.serviceSubCategory.findUnique({
      where: { id: subCategoryId },
      select: { id: true, categoryId: true, isActive: true },
    });

    if (!subCategory || !subCategory.isActive || subCategory.categoryId !== categoryId) {
      return res.status(400).json({ error: 'Selected category/sub-category is invalid.' });
    }

    const [cnicFront, cnicBack] = await Promise.all([
      uploadImageFile(cnicFrontFile),
      uploadImageFile(cnicBackFile),
    ]);

    const existing = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });

    if (existing?.status === 'APPROVED') {
      return res.status(409).json({ error: 'You are already an approved service provider.' });
    }

    const payload = {
      userId: req.user.id,
      categoryId,
      subCategoryId,
      cnicFront,
      cnicBack,
      experience: parsedExp,
      phone: String(phone).trim(),
      description: description?.trim() || null,
      status: 'PENDING',
      rejectionReason: null,
    };

    const provider = existing
      ? await prisma.serviceProvider.update({ where: { userId: req.user.id }, data: payload })
      : await prisma.serviceProvider.create({ data: payload });

    res.status(201).json({ message: 'Registration submitted. Waiting for admin approval.', provider });
  } catch (error) {
    console.error('Register provider error:', error);
    res.status(500).json({ error: 'Failed to submit provider registration.' });
  }
});

router.post('/providers/:id/review', authenticate, async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const parsedStars = parseInt(stars, 10);

    if (!Number.isInteger(parsedStars) || parsedStars < 1 || parsedStars > 5) {
      return res.status(400).json({ error: 'Stars must be between 1 and 5.' });
    }

    const provider = await prisma.serviceProvider.findUnique({ where: { id: req.params.id } });
    if (!provider || provider.status !== 'APPROVED') {
      return res.status(404).json({ error: 'Provider not found.' });
    }

    if (provider.userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot review your own profile.' });
    }

    const review = await prisma.serviceReview.upsert({
      where: { providerId_seekerId: { providerId: req.params.id, seekerId: req.user.id } },
      update: { stars: parsedStars, comment: comment?.trim() || null },
      create: {
        providerId: req.params.id,
        seekerId: req.user.id,
        stars: parsedStars,
        comment: comment?.trim() || null,
      },
    });

    res.json({ message: 'Review submitted successfully.', review });
  } catch (error) {
    console.error('Submit service review error:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// Admin
router.get('/admin/pending', authenticate, adminOnly, async (req, res) => {
  try {
    const providers = await prisma.serviceProvider.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, photoUrl: true } },
        category: { select: { id: true, name: true, emoji: true } },
        subCategory: { select: { id: true, name: true } },
      },
    });

    res.json({ providers });
  } catch (error) {
    console.error('Admin get pending providers error:', error);
    res.status(500).json({ error: 'Failed to load pending providers.' });
  }
});

router.put('/admin/providers/:id/approve', authenticate, adminOnly, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED', rejectionReason: null },
      include: { user: { select: { id: true, name: true } } },
    });

    try {
      await sendPushToUser(
        provider.userId,
        '✅ Service Provider Approved',
        'Your service provider request has been approved. You are now visible in services.',
        { type: 'SERVICE_APPROVED', providerId: provider.id }
      );
    } catch (e) {
      console.error('Push error (service approved):', e.message);
    }

    res.json({ message: 'Provider approved.', provider });
  } catch (error) {
    console.error('Admin approve provider error:', error);
    res.status(500).json({ error: 'Failed to approve provider.' });
  }
});

router.put('/admin/providers/:id/reject', authenticate, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const provider = await prisma.serviceProvider.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', rejectionReason: reason?.trim() || 'Rejected by admin' },
      include: { user: { select: { id: true, name: true } } },
    });

    try {
      await sendPushToUser(
        provider.userId,
        '❌ Service Provider Rejected',
        provider.rejectionReason || 'Your service provider request was rejected.',
        { type: 'SERVICE_REJECTED', providerId: provider.id }
      );
    } catch (e) {
      console.error('Push error (service rejected):', e.message);
    }

    res.json({ message: 'Provider rejected.', provider });
  } catch (error) {
    console.error('Admin reject provider error:', error);
    res.status(500).json({ error: 'Failed to reject provider.' });
  }
});

router.post('/admin/categories', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, emoji } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Category name is required.' });

    const category = await prisma.serviceCategory.create({
      data: { name: name.trim(), emoji: emoji?.trim() || '🔧' },
    });

    res.status(201).json({ message: 'Category added.', category });
  } catch (error) {
    console.error('Admin add category error:', error);
    res.status(500).json({ error: 'Failed to add category.' });
  }
});

router.post('/admin/categories/:id/sub', authenticate, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Sub-category name is required.' });

    const subCategory = await prisma.serviceSubCategory.create({
      data: {
        categoryId: req.params.id,
        name: name.trim(),
      },
    });

    res.status(201).json({ message: 'Sub-category added.', subCategory });
  } catch (error) {
    console.error('Admin add sub-category error:', error);
    res.status(500).json({ error: 'Failed to add sub-category.' });
  }
});

router.delete('/admin/categories/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.serviceCategory.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    console.error('Admin delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

router.delete('/admin/subcategories/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await prisma.serviceSubCategory.delete({ where: { id: req.params.id } });
    res.json({ message: 'Sub-category deleted.' });
  } catch (error) {
    console.error('Admin delete sub-category error:', error);
    res.status(500).json({ error: 'Failed to delete sub-category.' });
  }
});

module.exports = router;
