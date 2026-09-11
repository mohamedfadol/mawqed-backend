 const prisma = require('../config/prisma');
const admin = require('../config/firebase');

async function saveNotification({
  userId,
  title,  
  body,
  type,  
  data = {},
}) {
  return prisma.notification.create({
    data: {
      userId: BigInt(userId),
      title,
      body,
      type,
      data,
    },
  });
}

async function sendPushToUser({
  userId,
  title,
  body,
  type,
  data = {},
}) {
  const tokens = await prisma.deviceToken.findMany({
    where: {
      userId: BigInt(userId),
      isActive: true,
    },
  });

  await saveNotification({
    userId,
    title,
    body,
    type,
    data,
  });

  if (tokens.length === 0) return;

  const messages = tokens.map((item) => ({
    token: item.token,
    notification: {
      title,
      body,
    },
    data: {
      type,
      ...Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          String(value),
        ])
      ),
    },
  }));

  const results = await Promise.allSettled(
    messages.map((message) => admin.messaging().send(message))
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    if (
      result.status === 'rejected' &&
      result.reason?.errorInfo?.code ===
        'messaging/registration-token-not-registered'
    ) {
      await prisma.deviceToken.update({
        where: {
          id: tokens[i].id,
        },
        data: {
          isActive: false,
        },
      });
    }
  }
}

module.exports = {
  sendPushToUser,
  saveNotification,
};