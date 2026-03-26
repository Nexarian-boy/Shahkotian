const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { sendPushToUser } = require('../utils/pushNotification');

const router = express.Router();

/**
 * GET /api/jobs
 * Get all active jobs with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isActive: true };
    if (category) where.category = category;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.job.count({ where }),
    ]);

    res.set('Cache-Control', 'public, max-age=30');
    res.json({ jobs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

/**
 * GET /api/jobs/categories
 * Get job category/type enums
 */
router.get('/categories', (req, res) => {
  res.json({
    categories: [
      { key: 'TEACHING', label: 'Teaching', icon: '📚' },
      { key: 'MEDICAL', label: 'Medical', icon: '🏥' },
      { key: 'IT', label: 'IT / Computer', icon: '💻' },
      { key: 'DRIVING', label: 'Driving', icon: '🚗' },
      { key: 'LABOUR', label: 'Labour', icon: '🔨' },
      { key: 'SHOP_WORK', label: 'Shop Work', icon: '🏪' },
      { key: 'OFFICE', label: 'Office', icon: '🏢' },
      { key: 'COOKING', label: 'Cooking', icon: '🍳' },
      { key: 'TAILORING', label: 'Tailoring', icon: '🧵' },
      { key: 'AGRICULTURE', label: 'Agriculture', icon: '🌾' },
      { key: 'OTHER', label: 'Other', icon: '📦' },
    ],
    types: [
      { key: 'FULL_TIME', label: 'Full Time' },
      { key: 'PART_TIME', label: 'Part Time' },
      { key: 'CONTRACT', label: 'Contract' },
      { key: 'INTERNSHIP', label: 'Internship' },
      { key: 'DAILY_WAGE', label: 'Daily Wage' },
    ],
  });
});

/**
 * GET /api/jobs/my
 * Get current user's posted jobs
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.user.id },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ jobs });
  } catch (error) {
    console.error('My jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch your jobs.' });
  }
});

/**
 * GET /api/jobs/can-post
 * Returns whether current user can create job posts
 */
router.get('/can-post', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { canPostJobs: true, jobPostRequestPending: true, role: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const canPostJobs = user.role === 'ADMIN' || user.canPostJobs;
    res.json({ canPostJobs, jobPostRequestPending: user.jobPostRequestPending });
  } catch (error) {
    console.error('Can-post check error:', error);
    res.status(500).json({ error: 'Failed to check permission.' });
  }
});

/**
 * GET /api/jobs/:id
 * Get a single job with applications (if owner)
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, photoUrl: true, phone: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job.' });
  }
});

/**
 * POST /api/jobs
 * Create a new job posting
 */
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && !req.user.canPostJobs) {
      return res.status(403).json({ error: 'You are not allowed to post jobs yet. Request access from admin.' });
    }

    const { title, company, description, category, type, salary, location, phone, whatsapp, requirements } = req.body;

    if (!title || !company || !description || !category || !phone) {
      return res.status(400).json({ error: 'Title, company, description, category, and phone are required.' });
    }

    const job = await prisma.job.create({
      data: {
        userId: req.user.id,
        title,
        company,
        description,
        category,
        type: type || 'FULL_TIME',
        salary: salary || null,
        location: location || 'Shahkot',
        phone,
        whatsapp: whatsapp || null,
        requirements: requirements || null,
      },
      include: {
        user: { select: { id: true, name: true, photoUrl: true } },
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job.' });
  }
});

/**
 * PUT /api/jobs/:id
 * Update a job posting (owner only)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { title, company, description, category, type, salary, location, phone, whatsapp, requirements, isActive } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (company !== undefined) data.company = company;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (type !== undefined) data.type = type;
    if (salary !== undefined) data.salary = salary || null;
    if (location !== undefined) data.location = location;
    if (phone !== undefined) data.phone = phone;
    if (whatsapp !== undefined) data.whatsapp = whatsapp || null;
    if (requirements !== undefined) data.requirements = requirements || null;
    if (isActive !== undefined) data.isActive = !!isActive;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    // Keep required core fields non-empty if they are being updated.
    if ((title !== undefined && !title) || (company !== undefined && !company) || (description !== undefined && !description) || (phone !== undefined && !phone)) {
      return res.status(400).json({ error: 'Title, company, description, and phone cannot be empty.' });
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job.' });
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job posting (owner or admin)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: 'Job deleted.' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});

/**
 * POST /api/jobs/:id/apply
 * Apply to a job
 */
router.post('/:id/apply', authenticate, async (req, res) => {
  try {
    const { message, phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (!job.isActive) return res.status(400).json({ error: 'This job is no longer active.' });
    if (job.userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot apply to your own job.' });
    }

    const existing = await prisma.jobApplication.findUnique({
      where: { jobId_userId: { jobId: req.params.id, userId: req.user.id } },
    });
    if (existing) return res.status(409).json({ error: 'You have already applied.' });

    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.params.id,
        userId: req.user.id,
        message: message || null,
        phone,
      },
    });

    // Notify the job poster
    try {
      await sendPushToUser(
        job.userId,
        '📋 New Job Application',
        `${req.user.name} applied to your job posting "${job.title}".`,
        { type: 'JOB_APPLICATION', jobId: job.id }
      );
    } catch (notifErr) {
      console.error('Notification error (job apply):', notifErr);
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: 'Failed to apply.' });
  }
});

/**
 * GET /api/jobs/:id/applications
 * Get applications for a job (owner only)
 */
router.get('/:id/applications', authenticate, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId: req.params.id },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, photoUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

module.exports = router;
