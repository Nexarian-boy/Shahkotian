const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const doctors = [
  {
    name: 'Dr. Imran Khalid',
    specialty: 'GENERAL_PHYSICIAN',
    clinicName: 'City Health Clinic Shahkot',
    address: 'Hospital Road, Shahkot',
    phone: '03001234001',
    whatsapp: '03001234001',
    timings: '9:00 AM - 1:00 PM',
    fee: 1200,
    education: 'MBBS',
    experience: '10 years',
    isVerified: true,
    isAvailableNow: true,
    weekdays: 'Mon,Tue,Wed,Thu,Fri,Sat',
    startTime: '09:00',
    endTime: '13:00',
    avgConsultTime: 15,
    onlineBooking: true,
  },
  {
    name: 'Dr. Sana Adeel',
    specialty: 'GYNECOLOGIST',
    clinicName: 'Niswan Care Clinic',
    address: 'College Road, Shahkot',
    phone: '03001234002',
    whatsapp: '03001234002',
    timings: '4:00 PM - 8:00 PM',
    fee: 1800,
    education: 'MBBS, FCPS (Gyne)',
    experience: '8 years',
    isVerified: true,
    isAvailableNow: false,
    weekdays: 'Mon,Tue,Wed,Thu,Fri',
    startTime: '16:00',
    endTime: '20:00',
    avgConsultTime: 20,
    onlineBooking: true,
  },
  {
    name: 'Dr. Hamza Tariq',
    specialty: 'PEDIATRICIAN',
    clinicName: 'Kids Care Shahkot',
    address: 'Main Bazar, Shahkot',
    phone: '03001234003',
    whatsapp: '03001234003',
    timings: '5:00 PM - 9:00 PM',
    fee: 1500,
    education: 'MBBS, DCH',
    experience: '7 years',
    isVerified: true,
    isAvailableNow: true,
    weekdays: 'Mon,Tue,Wed,Thu,Fri,Sat',
    startTime: '17:00',
    endTime: '21:00',
    avgConsultTime: 15,
    onlineBooking: true,
  },
  {
    name: 'Dr. Umer Farooq',
    specialty: 'CARDIOLOGIST',
    clinicName: 'Heart Point Clinic',
    address: 'GT Road, Shahkot',
    phone: '03001234004',
    whatsapp: '03001234004',
    timings: '6:00 PM - 9:00 PM',
    fee: 2500,
    education: 'MBBS, FCPS (Cardiology)',
    experience: '12 years',
    isVerified: true,
    isAvailableNow: false,
    weekdays: 'Mon,Wed,Fri',
    startTime: '18:00',
    endTime: '21:00',
    avgConsultTime: 20,
    onlineBooking: true,
  },
  {
    name: 'Dr. Areeba Javed',
    specialty: 'DERMATOLOGIST',
    clinicName: 'Skin & Laser Care',
    address: 'Railway Road, Shahkot',
    phone: '03001234005',
    whatsapp: '03001234005',
    timings: '3:00 PM - 7:00 PM',
    fee: 2000,
    education: 'MBBS, MCPS (Dermatology)',
    experience: '9 years',
    isVerified: true,
    isAvailableNow: true,
    weekdays: 'Tue,Thu,Sat',
    startTime: '15:00',
    endTime: '19:00',
    avgConsultTime: 20,
    onlineBooking: true,
  },
  {
    name: 'Dr. Bilal Yousaf',
    specialty: 'ENT',
    clinicName: 'ENT Care Shahkot',
    address: 'Mandi Road, Shahkot',
    phone: '03001234006',
    whatsapp: '03001234006',
    timings: '10:00 AM - 2:00 PM',
    fee: 1400,
    education: 'MBBS, DLO',
    experience: '6 years',
    isVerified: true,
    isAvailableNow: false,
    weekdays: 'Mon,Tue,Wed,Thu,Fri',
    startTime: '10:00',
    endTime: '14:00',
    avgConsultTime: 15,
    onlineBooking: true,
  },
  {
    name: 'Dr. Khadija Noor',
    specialty: 'DENTIST',
    clinicName: 'Smile Dental Care',
    address: 'Kachehri Road, Shahkot',
    phone: '03001234007',
    whatsapp: '03001234007',
    timings: '12:00 PM - 6:00 PM',
    fee: 1200,
    education: 'BDS',
    experience: '5 years',
    isVerified: true,
    isAvailableNow: true,
    weekdays: 'Mon,Tue,Wed,Thu,Fri,Sat',
    startTime: '12:00',
    endTime: '18:00',
    avgConsultTime: 20,
    onlineBooking: true,
  },
  {
    name: 'Dr. Faisal Rauf',
    specialty: 'ORTHOPEDIC',
    clinicName: 'Bone & Joint Clinic',
    address: 'Jaranwala Road, Shahkot',
    phone: '03001234008',
    whatsapp: '03001234008',
    timings: '6:00 PM - 10:00 PM',
    fee: 2200,
    education: 'MBBS, FCPS (Ortho)',
    experience: '11 years',
    isVerified: true,
    isAvailableNow: false,
    weekdays: 'Mon,Wed,Fri,Sun',
    startTime: '18:00',
    endTime: '22:00',
    avgConsultTime: 20,
    onlineBooking: true,
  },
  {
    name: 'Dr. Maryam Fatima',
    specialty: 'OPHTHALMOLOGIST',
    clinicName: 'Noor Eye Center',
    address: 'Chowk Bazar, Shahkot',
    phone: '03001234009',
    whatsapp: '03001234009',
    timings: '11:00 AM - 3:00 PM',
    fee: 1700,
    education: 'MBBS, FCPS (Eye)',
    experience: '8 years',
    isVerified: true,
    isAvailableNow: true,
    weekdays: 'Mon,Tue,Thu,Sat',
    startTime: '11:00',
    endTime: '15:00',
    avgConsultTime: 15,
    onlineBooking: true,
  },
  {
    name: 'Dr. Ali Hassan',
    specialty: 'PSYCHIATRIST',
    clinicName: 'Mind Wellness Clinic',
    address: 'Canal Road, Shahkot',
    phone: '03001234010',
    whatsapp: '03001234010',
    timings: '5:00 PM - 8:00 PM',
    fee: 2500,
    education: 'MBBS, FCPS (Psychiatry)',
    experience: '9 years',
    isVerified: true,
    isAvailableNow: false,
    weekdays: 'Tue,Thu,Sat',
    startTime: '17:00',
    endTime: '20:00',
    avgConsultTime: 25,
    onlineBooking: true,
  },
  {
    name: 'Dr. Tariq Mehmood',
    specialty: 'HOMEOPATHIC',
    clinicName: 'Shifa Homeo Clinic',
    address: 'Railway Phatak, Shahkot',
    phone: '03001234011',
    whatsapp: '03001234011',
    timings: '9:00 AM - 12:00 PM / 5:00 PM - 8:00 PM',
    fee: 800,
    education: 'DHMS',
    experience: '15 years',
    isVerified: true,
    isAvailableNow: true,
    weekdays: 'Mon,Tue,Wed,Thu,Fri,Sat',
    startTime: '09:00',
    endTime: '20:00',
    avgConsultTime: 15,
    onlineBooking: false,
  },
  {
    name: 'Hakeem Abdul Rehman',
    specialty: 'HAKEEM',
    clinicName: 'Rehman Tibb Center',
    address: 'Old Bus Stand, Shahkot',
    phone: '03001234012',
    whatsapp: '03001234012',
    timings: '10:00 AM - 1:00 PM / 6:00 PM - 9:00 PM',
    fee: 700,
    education: 'BUMS',
    experience: '18 years',
    isVerified: true,
    isAvailableNow: false,
    weekdays: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    startTime: '10:00',
    endTime: '21:00',
    avgConsultTime: 20,
    onlineBooking: false,
  }
];

async function upsertDemoDoctors() {
  let created = 0;
  let updated = 0;

  for (const entry of doctors) {
    const existing = await prisma.doctor.findFirst({
      where: { name: entry.name, phone: entry.phone },
      select: { id: true },
    });

    const schedule = {
      weekdays: entry.weekdays,
      timing: entry.timings,
      note: 'Schedule is for public demo display and may vary.',
    };

    if (existing) {
      await prisma.doctor.update({
        where: { id: existing.id },
        data: {
          ...entry,
          schedule,
        },
      });
      updated += 1;
    } else {
      await prisma.doctor.create({
        data: {
          ...entry,
          schedule,
        },
      });
      created += 1;
    }
  }

  const total = await prisma.doctor.count();
  console.log(`Doctors sync complete. Created: ${created}, Updated: ${updated}, Total Doctors: ${total}`);
}

upsertDemoDoctors()
  .catch((error) => {
    console.error('Failed to add demo doctors:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
