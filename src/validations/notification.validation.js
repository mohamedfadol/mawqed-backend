const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

function validateUserId(user) {
  const userId = toBigInt(user?.id);

  if (!userId) {
    throw new ApiError('Unauthorized user', 401);
  }

  return userId;
}

function validateNotificationId(id) {
  const notificationId = toBigInt(id);

  if (!notificationId) {
    throw new ApiError('Invalid notification id', 422);
  }

  return notificationId;
}

module.exports = {
  validateUserId,
  validateNotificationId,
};