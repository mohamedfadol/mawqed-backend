const UserNotificationService = require('../services/user-notification.service');

const {
  validateUserId,
  validateNotificationId,
} = require('../validations/notification.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getMyNotifications(req, res) {
  try {
    const userId = validateUserId(req.user);

    const notifications =
      await UserNotificationService.getMyNotifications(userId);

    return res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getUnreadCount(req, res) {
  try {
    const userId = validateUserId(req.user);

    const count = await UserNotificationService.getUnreadCount(userId);

    return res.json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function markAsRead(req, res) {
  try {
    const userId = validateUserId(req.user);
    const id = validateNotificationId(req.params.id);

    await UserNotificationService.markAsRead({
      id,
      userId,
    });

    return res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteNotification(req, res) {
  try {
    const userId = validateUserId(req.user);
    const id = validateNotificationId(req.params.id);

    await UserNotificationService.deleteNotification({
      id,
      userId,
    });

    return res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
};