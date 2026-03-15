require('dotenv').config();

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = process.env.DATABASE_URL
  ? new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
  : new PrismaClient();

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in environment');
  }

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!admin) {
    throw new Error('No active ADMIN user found');
  }

  const token = jwt.sign(
    { userId: admin.id, role: 'ADMIN' },
    process.env.JWT_SECRET
  );

  process.stdout.write(token);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
