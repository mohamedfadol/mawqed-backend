const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

function validatePackageId(id) {
  const packageId = toBigInt(id);

  if (!packageId) {
    throw new ApiError('Invalid package id', 422);
  }

  return packageId;
}

function validatePackageQuery(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);

  const isActive =
    query.isActive === undefined
      ? undefined
      : query.isActive === 'true' || query.isActive === true;

  return {
    page,
    limit,
    isActive,
  };
}

function validateCreatePackage(body) {
  const {
    name,
    description,
    price,
    durationDays,
    maxListings,
    maxAuctionRequests,
    featuredListings,
    maxBids,
    isActive,
  } = body || {};

  if (!name) {
    throw new ApiError('Package name is required', 422);
  }

  const parsedPrice = Number(price);

  if (!price || Number.isNaN(parsedPrice) || parsedPrice < 0) {
    throw new ApiError('Valid price is required', 422);
  }

  const parsedDurationDays = Number(durationDays);

  if (
    !durationDays ||
    Number.isNaN(parsedDurationDays) ||
    parsedDurationDays <= 0
  ) {
    throw new ApiError('Valid durationDays is required', 422);
  }

  return {
    name,
    description: description || null,
    price: parsedPrice,
    durationDays: parsedDurationDays,
    maxListings: maxListings !== undefined && maxListings !== '' ? Number(maxListings): null,
    maxAuctionRequests: maxAuctionRequests !== undefined && maxAuctionRequests !== '' ? Number(maxAuctionRequests) : null,
    featuredListings: featuredListings !== undefined && featuredListings !== ''? Number(featuredListings): null,
    maxBids: maxBids !== undefined && maxBids !== ''? Number(maxBids): null,
    
    isActive: isActive === undefined ? true : isActive === true || isActive === 'true',
  };
}

function validateUpdatePackage(body) {
  const data = {};

  if (body.name !== undefined) {
    if (!body.name) {
      throw new ApiError('Package name cannot be empty', 422);
    }

    data.name = body.name;
  }

  if (body.description !== undefined) {
    data.description = body.description || null;
  }

  if (body.price !== undefined) {
    const price = Number(body.price);

    if (Number.isNaN(price) || price < 0) {
      throw new ApiError('Invalid price', 422);
    }

    data.price = price;
  }

  if (body.durationDays !== undefined) {
    const durationDays = Number(body.durationDays);

    if (Number.isNaN(durationDays) || durationDays <= 0) {
      throw new ApiError('Invalid durationDays', 422);
    }

    data.durationDays = durationDays;
  }

  if (body.maxListings !== undefined) {
    data.maxListings =
      body.maxListings === '' || body.maxListings === null
        ? null
        : Number(body.maxListings);
  }

  if (body.maxAuctionRequests !== undefined) {
    data.maxAuctionRequests =
      body.maxAuctionRequests === '' || body.maxAuctionRequests === null
        ? null
        : Number(body.maxAuctionRequests);
  }

  if (body.featuredListings !== undefined) {
    data.featuredListings =
      body.featuredListings === '' || body.featuredListings === null
        ? null
        : Number(body.featuredListings);
  }

  if (body.maxBids !== undefined) {
    data.maxBids =
      body.maxBids === '' || body.maxBids === null
        ? null
        : Number(body.maxBids);
  }

  if (body.isActive !== undefined) {
    data.isActive = body.isActive === true || body.isActive === 'true';
  }

  return data;
}

module.exports = {
  validatePackageId,
  validatePackageQuery,
  validateCreatePackage,
  validateUpdatePackage,
};