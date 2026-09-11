const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

const ALLOWED_LISTING_STATUSES = [
  'pending_review',
  'approved',
  'rejected',
  'auction_requested',
  'in_auction',
  'sold',
];

const ALLOWED_UPDATE_FIELDS = [
  'title',
  'referenceNumber',
  'productionYear',
  'conditionStatus',
  'description',
  'reservePrice',
  'estimatedPrice',
  'status',
];

function parseBoolean(value) {
  return value === true || value === 'true';
}

function validateListingId(id) {
  const parsedId = toBigInt(id);

  if (!parsedId) {
    throw new ApiError('Invalid listing id', 422);
  }

  return parsedId;
}

function validateCreateListing(body, user) {
  const {
    brandId,
    title,
    referenceNumber,
    productionYear,
    conditionStatus,
    hasOriginalBox,
    hasPapers,
    hasServiceHistory,
    description,
    reservePrice,
    estimatedPrice,
  } = body || {};

  if (!brandId || !title) {
    throw new ApiError('brandId and title are required', 422);
  }

  const parsedBrandId = toBigInt(brandId);
  const sellerId = toBigInt(user?.id);

  if (!parsedBrandId) {
    throw new ApiError('Invalid brandId', 422);
  }

  if (!sellerId) {
    throw new ApiError('Unauthorized user', 401);
  }

  return {
    sellerId,
    brandId: parsedBrandId,
    title,
    referenceNumber: referenceNumber || null,
    productionYear: productionYear ? Number(productionYear) : null,
    conditionStatus: conditionStatus || 'excellent',
    hasOriginalBox: parseBoolean(hasOriginalBox),
    hasPapers: parseBoolean(hasPapers),
    hasServiceHistory: parseBoolean(hasServiceHistory),
    description: description || null,
    reservePrice: reservePrice ? Number(reservePrice) : null,
    estimatedPrice: estimatedPrice ? Number(estimatedPrice) : null,
    status: 'pending_review',
  };
}

function validateListingQuery(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);

  const limit = Math.min(
    Math.max(parseInt(query.limit || '10', 10), 1),
    50
  );

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

function validateUpdateListing(body) {
  const data = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (body[field] !== undefined) {
      if (
        ['productionYear', 'reservePrice', 'estimatedPrice'].includes(field)
      ) {
        data[field] = body[field] ? Number(body[field]) : null;
      } else {
        data[field] = body[field];
      }
    }
  }

  if (body.brandId !== undefined) {
    const brandId = toBigInt(body.brandId);

    if (!brandId) {
      throw new ApiError('Invalid brandId', 422);
    }

    data.brandId = brandId;
  }

  if (body.hasOriginalBox !== undefined) {
    data.hasOriginalBox = parseBoolean(body.hasOriginalBox);
  }

  if (body.hasPapers !== undefined) {
    data.hasPapers = parseBoolean(body.hasPapers);
  }

  if (body.hasServiceHistory !== undefined) {
    data.hasServiceHistory = parseBoolean(body.hasServiceHistory);
  }

  if (data.status && !ALLOWED_LISTING_STATUSES.includes(data.status)) {
    throw new ApiError('Invalid listing status', 422);
  }

  return data;
}

function validateUploadedFiles(files) {
  if (!files || files.length === 0) {
    throw new ApiError('No images uploaded', 422);
  }

  return files;
}

module.exports = {
  validateListingId,
  validateCreateListing,
  validateListingQuery,
  validateUpdateListing,
  validateUploadedFiles,
};