const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

const ALLOWED_AUCTION_STATUSES = [
  'scheduled',
  'live',
  'ended',
  'cancelled',
];

function validateAuctionId(id) {
  const parsedId = toBigInt(id);

  if (!parsedId) {
    throw new ApiError('Invalid auction id', 422);
  }

  return parsedId;
}

function validateCreateAuction(body) {
  const {
    watchListingId,
    startPrice,
    bidIncrement,
    startsAt,
    endsAt,
  } = body || {};

  if (!watchListingId || !startPrice || !startsAt || !endsAt) {
    throw new ApiError(
      'watchListingId, startPrice, startsAt and endsAt are required',
      422
    );
  }

  const listingId = toBigInt(watchListingId);

  if (!listingId) {
    throw new ApiError('Invalid watchListingId', 422);
  }

  const startPriceNumber = Number(startPrice);
  const bidIncrementNumber = bidIncrement ? Number(bidIncrement) : 1000;

  if (Number.isNaN(startPriceNumber) || startPriceNumber <= 0) {
    throw new ApiError('Invalid startPrice', 422);
  }

  if (Number.isNaN(bidIncrementNumber) || bidIncrementNumber <= 0) {
    throw new ApiError('Invalid bidIncrement', 422);
  }

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new ApiError('Invalid startsAt or endsAt date', 422);
  }

  if (endDate <= startDate) {
    throw new ApiError('endsAt must be after startsAt', 422);
  }

  return {
    listingId,
    startPrice: startPriceNumber,
    bidIncrement: bidIncrementNumber,
    startsAt: startDate,
    endsAt: endDate,
  };
}

function validateAuctionQuery(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const status = query.status || '';

  if (status && !ALLOWED_AUCTION_STATUSES.includes(status)) {
    throw new ApiError('Invalid status filter', 422);
  }

  return {
    page,
    limit,
    status,
  };
}

function validateUpdateAuctionStatus(body) {
  const { status } = body || {};

  if (!status) {
    throw new ApiError('status is required', 422);
  }

  if (!ALLOWED_AUCTION_STATUSES.includes(status)) {
    throw new ApiError('Invalid status', 422);
  }

  return {
    status,
  };
}

module.exports = {
  validateAuctionId,
  validateCreateAuction,
  validateAuctionQuery,
  validateUpdateAuctionStatus,
};