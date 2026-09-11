const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

function validateAuctionId(id) {
  const parsedId = toBigInt(id);

  if (!parsedId) {
    throw new ApiError('Invalid auction id', 422);
  }

  return parsedId;
}

function validateCreateBid(body, user) {
  const amount = Number(body?.amount);
  const userId = toBigInt(user?.id);

  if (!userId) {
    throw new ApiError('Unauthorized user', 401);
  }

  if (!amount || Number.isNaN(amount) || amount <= 0) {
    throw new ApiError('Valid bid amount is required', 422);
  }

  return {
    userId,
    amount,
  };
}

module.exports = {
  validateAuctionId,
  validateCreateBid,
};