const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', authMiddleware, notificationController.getMyNotifications);

router.get(
  '/unread-count',
  authMiddleware,
  notificationController.getUnreadCount
);

router.patch(
  '/:id/read',
  authMiddleware,
  notificationController.markAsRead
);

router.delete(
  '/:id',
  authMiddleware,
  notificationController.deleteNotification
);

module.exports = router;