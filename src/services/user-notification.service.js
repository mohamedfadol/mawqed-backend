const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');
const NotificationRepository = require('../repositories/notification.repository');

class UserNotificationService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async getMyNotifications(userId) {
    const notifications = await NotificationRepository.findByUser(userId);

    return this.format(notifications);
  }

  static async getUnreadCount(userId) {
    const count = await NotificationRepository.countUnread(userId);

    return count;
  }

  static async markAsRead({ id, userId }) {
    const notification = await NotificationRepository.findByIdAndUser(
      id,
      userId
    );

    if (!notification) {
      throw new ApiError('Notification not found', 404);
    }

    await NotificationRepository.markAsRead(id, userId);

    return true;
  }

  static async deleteNotification({ id, userId }) {
    const notification = await NotificationRepository.findByIdAndUser(
      id,
      userId
    );

    if (!notification) {
      throw new ApiError('Notification not found', 404);
    }

    await NotificationRepository.delete(id, userId);

    return true;
  }
}

module.exports = UserNotificationService;