const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const bySpecialty = await prisma.doctor.groupBy({
    by: ['specialty'],
    _count: { _all: true },
    orderBy: { specialty: 'asc' },
  });

  const latest = await prisma.doctor.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    select: { name: true, specialty: true, clinicName: true, phone: true },
  });

  console.log('Specialty counts:', bySpecialty);
  console.log('Latest doctors:', latest);
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
