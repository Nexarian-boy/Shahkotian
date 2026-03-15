require('dotenv').config();

const prisma = require('../../src/config/database');

async function testDbRotation() {
  console.log('\nTesting Database Rotation System...\n');

  const dbManager = prisma.__dbManager;
  if (!dbManager) {
    console.log('DB manager not found on prisma proxy.');
    return;
  }

  await dbManager.initialize();

  const statuses = await dbManager.getAllStatus();
  console.log('Database status:');
  statuses.forEach((db) => {
    const marker = db.isActive ? '<- ACTIVE (writes)' : '';
    console.log(`  DB#${db.index}: ${db.sizeMB}MB ${marker}`.trim());
  });

  const anyUser = await prisma.user.findFirst({ select: { id: true } });
  if (!anyUser) {
    console.log('No user found for write test. Skipping write validation.');
    return;
  }

  console.log(`\nActive DB index: ${dbManager.activeIndex}`);
  console.log('Write test: creating one notification on active DB...');

  const testNotification = await prisma.notification.create({
    data: {
      userId: anyUser.id,
      title: 'DB Rotation Test',
      body: `Written on DB#${dbManager.activeIndex} at ${new Date().toISOString()}`,
    },
  });

  console.log(`Write successful: ${testNotification.id}`);

  await prisma.notification.delete({ where: { id: testNotification.id } });
  console.log('Cleanup successful.\n');
}

testDbRotation()
  .catch((error) => {
    console.error('DB rotation test failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
