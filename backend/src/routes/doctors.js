const express = require('express');
const prisma = require('../config/database');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ============ PUBLIC ROUTES ============

/**
 * GET /api/doctors
 * Get all doctors with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { search, specialty, page = 1 } = req.query;
    const limit = 50;

    const where = {};
    
    if (specialty && specialty !== 'ALL') {
      where.specialty = specialty;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { clinicName: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip: (parseInt(page) - 1) * limit,
        take: limit,
        orderBy: [
          { isVerified: 'desc' },
          { name: 'asc' },
        ],
      }),
      prisma.doctor.count({ where }),
    ]);

    res.json({
      doctors,
      pagination: {
        page: parseInt(page),
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to load doctors.' });
  }
});

/**
 * GET /api/doctors/specialties
 * Get list of specialties with counts
 */
router.get('/specialties', async (req, res) => {
  try {
    const specialties = [
      { key: 'GENERAL_PHYSICIAN', label: 'General Physician', icon: '👨‍⚕️' },
      { key: 'PEDIATRICIAN', label: 'Child Specialist', icon: '👶' },
      { key: 'GYNECOLOGIST', label: 'Gynecologist', icon: '🤰' },
      { key: 'CARDIOLOGIST', label: 'Heart Specialist', icon: '❤️' },
      { key: 'DERMATOLOGIST', label: 'Skin Specialist', icon: '🧴' },
      { key: 'ENT', label: 'ENT Specialist', icon: '👂' },
      { key: 'ORTHOPEDIC', label: 'Bone & Joint', icon: '🦴' },
      { key: 'DENTIST', label: 'Dentist', icon: '🦷' },
      { key: 'OPHTHALMOLOGIST', label: 'Eye Specialist', icon: '👁️' },
      { key: 'NEUROLOGIST', label: 'Neurologist', icon: '🧠' },
      { key: 'PSYCHIATRIST', label: 'Psychiatrist', icon: '🧘' },
      { key: 'UROLOGIST', label: 'Urologist', icon: '💧' },
      { key: 'HOMEOPATHIC', label: 'Homeopathic', icon: '🌿' },
      { key: 'HAKEEM', label: 'Hakeem', icon: '🍃' },
      { key: 'OTHER', label: 'Other', icon: '➕' },
    ];

    // Get counts for each specialty
    const counts = await prisma.doctor.groupBy({
      by: ['specialty'],
      _count: { specialty: true },
    });

    const countMap = {};
    counts.forEach(c => {
      countMap[c.specialty] = c._count.specialty;
    });

    const result = specialties.map(s => ({
      ...s,
      count: countMap[s.key] || 0,
    }));

    res.json({ specialties: result });
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({ error: 'Failed to load specialties.' });
  }
});

/**
 * GET /api/doctors/:id
 * Get single doctor details
 */
router.get('/:id', async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Failed to load doctor.' });
  }
});

// ============ ADMIN ROUTES ============

/**
 * POST /api/doctors
 * Add a new doctor (admin only)
 */
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const {
      name,
      specialty,
      clinicName,
      address,
      phone,
      whatsapp,
      timings,
      fee,
      education,
      experience,
      isVerified,
      latitude,
      longitude,
    } = req.body;

    if (!name || !specialty || !address || !phone) {
      return res.status(400).json({ error: 'Name, specialty, address, and phone are required.' });
    }

    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialty,
        clinicName: clinicName || null,
        address,
        phone,
        whatsapp: whatsapp || phone,
        timings: timings || null,
        fee: fee ? parseInt(fee, 10) : null,
        education: education || null,
        experience: experience || null,
        isVerified: isVerified || false,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    res.status(201).json({ message: 'Doctor added successfully.', doctor });
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ error: 'Failed to add doctor.' });
  }
});

/**
 * PUT /api/doctors/:id
 * Update a doctor (admin only)
 */
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const existing = await prisma.doctor.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    const {
      name,
      specialty,
      clinicName,
      address,
      phone,
      whatsapp,
      timings,
      fee,
      education,
      experience,
      isVerified,
      latitude,
      longitude,
    } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(specialty && { specialty }),
        ...(clinicName !== undefined && { clinicName }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(timings !== undefined && { timings }),
        ...(fee !== undefined && { fee: fee ? parseInt(fee, 10) : null }),
        ...(education !== undefined && { education }),
        ...(experience !== undefined && { experience }),
        ...(isVerified !== undefined && { isVerified }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
      },
    });

    res.json({ message: 'Doctor updated successfully.', doctor });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Failed to update doctor.' });
  }
});

/**
 * DELETE /api/doctors/:id
 * Delete a doctor (admin only)
 */
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const existing = await prisma.doctor.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    await prisma.doctor.delete({ where: { id: req.params.id } });
    res.json({ message: 'Doctor deleted successfully.' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Failed to delete doctor.' });
  }
});

module.exports = router;
