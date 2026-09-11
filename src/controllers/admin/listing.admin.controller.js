const AdminListingService = require('../../services/admin-listing.service');
const {
  validateListingId,
  validateListingQuery,
  validateUpdateListingStatus,
} = require('../../validations/listing.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getListings(req, res) {
  try {
    const query = validateListingQuery(req.query);

    const result = await AdminListingService.getListings(query);

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getListingDetails(req, res) {
  try {
    const id = validateListingId(req.params.id);

    const listing = await AdminListingService.getListingDetails(id);

    return res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateListingStatus(req, res) {
  try {
    const id = validateListingId(req.params.id);
    const payload = validateUpdateListingStatus(req.body);

    const listing = await AdminListingService.updateListingStatus(id, payload);

    return res.json({
      success: true,
      message: 'Listing status updated',
      data: listing,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteListing(req, res) {
  try {
    const id = validateListingId(req.params.id);

    await AdminListingService.deleteListing(id);

    return res.json({
      success: true,
      message: 'Listing deleted',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getListings,
  getListingDetails,
  updateListingStatus,
  deleteListing,
};