const prisma = require('../config/database');
const firebaseAdmin = require('../config/firebase');

/**
 * Send push notification + save in-app notification for a user
 */
async function sendPushToUser(userId, title, body, data = {}) {
  // 1. Save in-app notification
  await prisma.notification.create({ data: { userId, title, body } });

  // 2. Send FCM push if Firebase is configured
  if (!firebaseAdmin) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) return;

  try {
    await firebaseAdmin.messaging().send({
      token: user.fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: 'high',
        notification: {
          channelId: 'apnashahkot_default',
          sound: 'default',
          priority: 'high',
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: { sound: 'default', badge: 1, 'content-available': 1 },
        },
      },
    });
  } catch (err) {
    console.error('FCM send error:', err.message);
    if (
      err.code === 'messaging/invalid-registration-token' ||
      err.code === 'messaging/registration-token-not-registered'
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: { fcmToken: null },
      });
    }
  }
}

module.exports = { sendPushToUser };
