const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

const ALLOWED_SUBSCRIPTION_STATUSES = [
  'active',
  'expired',
  'cancelled',
  'pending_payment',
];

function validateSubscriptionId(id) {
  const subscriptionId = toBigInt(id);

  if (!subscriptionId) {
    throw new ApiError('Invalid subscription id', 422);
  }

  return subscriptionId;
}

function validateUserId(user) {
  const userId = toBigInt(user?.id);

  if (!userId) {
    throw new ApiError('Unauthorized user', 401);
  }

  return userId;
}

function validateAdminSubscriptionQuery(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);

  const userId = query.userId ? toBigInt(query.userId) : null;
  const packageId = query.packageId ? toBigInt(query.packageId) : null;
  const status = query.status || '';

  if (query.userId && !userId) {
    throw new ApiError('Invalid userId', 422);
  }

  if (query.packageId && !packageId) {
    throw new ApiError('Invalid packageId', 422);
  }

  if (status && !ALLOWED_SUBSCRIPTION_STATUSES.includes(status)) {
    throw new ApiError('Invalid subscription status', 422);
  }

  return {
    page,
    limit,
    userId,
    packageId,
    status,
  };
}

function validateCreateSubscription(body) {
  const { userId, packageId, status } = body || {};

  const parsedUserId = toBigInt(userId);
  const parsedPackageId = toBigInt(packageId);

  if (!parsedUserId) {
    throw new ApiError('Valid userId is required', 422);
  }

  if (!parsedPackageId) {
    throw new ApiError('Valid packageId is required', 422);
  }

  if (status && !ALLOWED_SUBSCRIPTION_STATUSES.includes(status)) {
    throw new ApiError('Invalid subscription status', 422);
  }

  return {
    userId: parsedUserId,
    packageId: parsedPackageId,
    status: status || 'active',
  };
}

function validateSubscribeToPackage(body, user) {
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

function validateUpdateSubscriptionStatus(body) {
  const { status } = body || {};

  if (!status) {
    throw new ApiError('status is required', 422);
  }

  if (!ALLOWED_SUBSCRIPTION_STATUSES.includes(status)) {
    throw new ApiError('Invalid subscription status', 422);
  }

  return {
    status,
  };
}

module.exports = {
  validateSubscriptionId,
  validateUserId,
  validateAdminSubscriptionQuery,
  validateCreateSubscription,
  validateSubscribeToPackage,
  validateUpdateSubscriptionStatus,
};