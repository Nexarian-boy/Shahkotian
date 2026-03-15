require('dotenv').config();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = process.env.DATABASE_URL
  ? new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
  : new PrismaClient();

const TEST_USER_COUNT = parseInt(process.env.TEST_USER_COUNT || '500', 10);
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test@12345';
const BATCH_SIZE = parseInt(process.env.TEST_USER_BATCH_SIZE || '50', 10);
const EMAIL_DOMAIN = process.env.TEST_USER_EMAIL_DOMAIN || 'shahkot-test.com';

function buildPhone(index) {
  return `030${String(index).padStart(8, '0')}`;
}

async function createTestUsers() {
  console.log(`Creating ${TEST_USER_COUNT} test users...`);
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set; Prisma will use default environment resolution.');
  }
  const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);

  const users = [];
  for (let i = 1; i <= TEST_USER_COUNT; i += 1) {
    users.push({
      name: `TestUser${i}`,
      email: `testuser${i}@${EMAIL_DOMAIN}`,
      password: hashedPassword,
      phone: buildPhone(i),
      role: 'USER',
      isActive: true,
      latitude: 31.5709 + (Math.random() - 0.5) * 0.1,
      longitude: 73.4853 + (Math.random() - 0.5) * 0.1,
    });
  }

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    await prisma.user.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`Created users ${i + 1} to ${i + batch.length}`);
  }

  console.log('Done creating test users.');
}

createTestUsers()
  .catch((error) => {
    console.error('Failed to create test users:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
