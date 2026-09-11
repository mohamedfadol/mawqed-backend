const UserListingService = require('../services/user-listing.service');

const {
  validateListingId,
  validateCreateListing,
  validateListingQuery,
  validateUpdateListing,
  validateUploadedFiles,
} = require('../validations/user-listing.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function createListing(req, res) {
  try {
    const payload = validateCreateListing(req.body, req.user);

    const listing = await UserListingService.createListing({
      payload,
      files: req.files || [],
      user: req.user,
    });

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: {
        listing,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function submitToAuction(req, res) {
  try {
    const listingId = validateListingId(req.params.id);

    const listing = await UserListingService.submitToAuction({
      listingId,
      user: req.user,
    });

    return res.json({
      success: true,
      message: 'Listing submitted to auction successfully',
      data: {
        listing,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getListings(req, res) {
  try {
    const query = validateListingQuery(req.query);

    const result = await UserListingService.getListings(query);

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getListingsWithoutPagintions(req, res) {
  try {
    const listings =
      await UserListingService.getListingsWithoutPagination();

    return res.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getListingById(req, res) {
  try {
    const id = validateListingId(req.params.id);

    const listing = await UserListingService.getListingById(id);

    return res.json({
      success: true,
      data: {
        listing,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateListing(req, res) {
  try {
    const id = validateListingId(req.params.id);
    const data = validateUpdateListing(req.body);

    const listing = await UserListingService.updateListing({
      id,
      user: req.user,
      data,
    });

    return res.json({
      success: true,
      message: 'Listing updated successfully',
      data: {
        listing,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteListing(req, res) {
  try {
    const id = validateListingId(req.params.id);

    await UserListingService.deleteListing({
      id,
      user: req.user,
    });

    return res.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function uploadListingImages(req, res) {
  try {
    const id = validateListingId(req.params.id);
    const files = validateUploadedFiles(req.files);

    const images = await UserListingService.uploadListingImages({
      id,
      user: req.user,
      files,
    });

    return res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createListing,
  getListings,
  getListingsWithoutPagintions,
  getListingById,
  updateListing,
  deleteListing,
  submitToAuction,
  uploadListingImages,
};