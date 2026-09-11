const prisma = require('../config/prisma');

class NotificationRepository {
  static findByUser(userId) {
    return prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static countUnread(userId) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  static findByIdAndUser(id, userId) {
    return prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  static markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  static delete(id, userId) {
    return prisma.notification.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}

module.exports = NotificationRepository;