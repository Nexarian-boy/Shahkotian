require('dotenv').config();
const prisma = require('./src/config/database');

async function run() {
  // Find a test user (not admin)
  const user = await prisma.user.findFirst({
    where: { role: { not: 'ADMIN' } },
    select: { id: true, name: true },
  });
  if (!user) { console.log('No test user found'); return; }
  console.log('Deleting:', user.name, user.id);
  await prisma.user.delete({ where: { id: user.id } });
  console.log('✅ Deleted successfully!');
  await prisma.$disconnect();
}

run().catch(e => console.error('❌', e.message));
