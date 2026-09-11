const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

function validateBidId(id) {
  const parsedId = toBigInt(id);

  if (!parsedId) {
    throw new ApiError('Invalid bid id', 422);
  }

  return parsedId;
}

function validateAuctionId(id) {
  const parsedId = toBigInt(id);

  if (!parsedId) {
    throw new ApiError('Invalid auction id', 422);
  }

  return parsedId;
}

function validateCreateBid(body, user) {
  const { auctionId, amount } = body || {};

  if (!auctionId) {
    throw new ApiError('auctionId is required', 422);
  }

  if (!amount) {
    throw new ApiError('amount is required', 422);
  }

  const parsedAuctionId = toBigInt(auctionId);
  const parsedUserId = toBigInt(user?.id);

  if (!parsedAuctionId) {
    throw new ApiError('Invalid auctionId', 422);
  }

  if (!parsedUserId) {
    throw new ApiError('Unauthorized user', 401);
  }

  const parsedAmount = Number(amount);

  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new ApiError('Invalid amount', 422);
  }

  return {
    auctionId: parsedAuctionId,
    userId: parsedUserId,
    amount: parsedAmount,
  };
}

function validateBidQuery(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);

  const auctionId = query.auctionId ? toBigInt(query.auctionId) : null;
  const userId = query.userId ? toBigInt(query.userId) : null;
  const status = query.status || '';

  if (query.auctionId && !auctionId) {
    throw new ApiError('Invalid auctionId', 422);
  }

  if (query.userId && !userId) {
    throw new ApiError('Invalid userId', 422);
  }

  return {
    page,
    limit,
    auctionId,
    userId,
    status,
  };
}

module.exports = {
  validateBidId,
  validateAuctionId,
  validateCreateBid,
  validateBidQuery,
};