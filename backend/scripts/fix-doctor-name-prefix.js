const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const doctors = await prisma.doctor.findMany({ select: { id: true, name: true } });
  let updated = 0;

  for (const d of doctors) {
    const normalized = d.name.replace(/^\s*Dr\.?\s+/i, '').trim();
    if (normalized && normalized !== d.name) {
      await prisma.doctor.update({ where: { id: d.id }, data: { name: normalized } });
      updated += 1;
    }
  }

  const sample = await prisma.doctor.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { name: true, specialty: true }
  });

  console.log(`Doctor name cleanup complete. Updated: ${updated}`);
  console.log('Latest names:', sample);
})()
  .catch((e) => {
    console.error('Cleanup failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
