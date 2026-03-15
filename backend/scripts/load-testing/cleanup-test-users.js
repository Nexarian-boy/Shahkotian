require('dotenv').config();

const prisma = require('../../src/config/database');

const EMAIL_DOMAIN = process.env.TEST_USER_EMAIL_DOMAIN || 'shahkot-test.com';

async function cleanupTestUsers() {
  console.log(`Cleaning up test users with domain @${EMAIL_DOMAIN} ...`);

  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: `@${EMAIL_DOMAIN}` } },
    select: { id: true },
  });

  const userIds = testUsers.map((u) => u.id);
  console.log(`Found ${userIds.length} test users.`);

  if (userIds.length === 0) {
    console.log('Nothing to clean up.');
    return;
  }

  await prisma.$transaction([
    prisma.rishtaInterest.deleteMany({
      where: {
        OR: [
          { fromUserId: { in: userIds } },
          { profile: { userId: { in: userIds } } },
        ],
      },
    }),
    prisma.rishtaShortlist.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.dMMessage.deleteMany({ where: { senderId: { in: userIds } } }),
    prisma.dMChat.deleteMany({
      where: {
        OR: [{ user1Id: { in: userIds } }, { user2Id: { in: userIds } }],
      },
    }),
    prisma.report.deleteMany({
      where: {
        OR: [
          { reporterUserId: { in: userIds } },
          { targetUserId: { in: userIds } },
        ],
      },
    }),
    prisma.block.deleteMany({
      where: {
        OR: [{ blockerId: { in: userIds } }, { blockedId: { in: userIds } }],
      },
    }),
    prisma.jobApplication.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.appointment.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.chatMessage.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.notification.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.listing.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.job.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.bloodDonor.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.rishtaProfile.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.trader.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);

  console.log('Cleanup complete.');
}

cleanupTestUsers()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
