const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

function validateAuctionId(id) {
  const auctionId = toBigInt(id);

  if (!auctionId) {
    throw new ApiError('Invalid auction id', 422);
  }

  return auctionId;
}

function validateUserId(user) {
  const userId = toBigInt(user?.id);

  if (!userId) {
    throw new ApiError('Unauthorized user', 401);
  }

  return userId;
}

module.exports = {
  validateAuctionId,
  validateUserId,
};