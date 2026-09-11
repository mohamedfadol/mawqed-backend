const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

function validateUserId(user) {
  const userId = toBigInt(user?.id);

  if (!userId) {
    throw new ApiError('Unauthorized user', 401);
  }

  return userId;
}

function validateCheckout(body, user) {
  const userId = validateUserId(user);
  const packageId = toBigInt(body?.packageId);

  if (!packageId) {
    throw new ApiError('Valid packageId is required', 422);
  }

  return {
    userId,
    packageId,
  };
}

function validatePaymentId(id) {
  const paymentId = toBigInt(id);

  if (!paymentId) {
    throw new ApiError('Invalid payment id', 422);
  }

  return paymentId;
}

module.exports = {
  validateCheckout,
  validatePaymentId,
  validateUserId,
};