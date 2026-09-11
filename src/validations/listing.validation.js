const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

const ALLOWED_LISTING_STATUSES = [
  'pending_review',
  'approved',
  'rejected',
  'auction_requested',
  'sold',
];

function validateListingId(id) {
  const parsedId = toBigInt(id);

  if (!parsedId) {
    throw new ApiError('Invalid listing id', 422);
  }

  return parsedId;
}

function validateUpdateListingStatus(body) {
  const { status, rejectionReason } = body || {};

  if (!status) {
    throw new ApiError('status is required', 422);
  }

  if (!ALLOWED_LISTING_STATUSES.includes(status)) {
    throw new ApiError('Invalid status', 422);
  }

  if (status === 'rejected' && !rejectionReason) {
    throw new ApiError('rejectionReason is required when status is rejected', 422);
  }

  return {
    status,
    rejectionReason,
  };
}

function validateListingQuery(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const status = query.status || '';

  if (status && !ALLOWED_LISTING_STATUSES.includes(status)) {
    throw new ApiError('Invalid status filter', 422);
  }

  return {
    page,
    limit,
    status,
  };
}

module.exports = {
  validateListingId,
  validateUpdateListingStatus,
  validateListingQuery,
};