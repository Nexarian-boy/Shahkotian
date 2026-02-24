/**
 * set-password.js
 * ---------------------------------------------------------------
 * Utility script to set a hashed password for a user directly in
 * the database — useful when editing via Prisma Studio (which
 * stores plain text that bcrypt cannot verify).
 *
 * Usage:
 *   node scripts/set-password.js <email> <newPassword>
 *
 * Example:
 *   node scripts/set-password.js admin@example.com MySecret123
 * ---------------------------------------------------------------
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const [,, email, plainPassword] = process.argv;

  if (!email || !plainPassword) {
    console.error('Usage: node scripts/set-password.js <email> <newPassword>');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(plainPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  console.log(`✅ Password updated successfully for ${user.name} (${email})`);
  console.log(`   New password: ${plainPassword}`);
  console.log(`   Hashed value stored in DB.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
