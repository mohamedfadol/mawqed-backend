const AuctionService = require('../../services/auction.service');

const {
  validateAuctionId,
  validateCreateAuction,
  validateAuctionQuery,
  validateUpdateAuctionStatus,
} = require('../../validations/auction.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getAuctions(req, res) {
  try {
    const query = validateAuctionQuery(req.query);

    const result = await AuctionService.getAuctions(query);

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getAuctionDetails(req, res) {
  try {
    const id = validateAuctionId(req.params.id);

    const auction = await AuctionService.getAuctionDetails(id);

    return res.json({
      success: true,
      data: auction,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function createAuction(req, res) {
  try {
    const payload = validateCreateAuction(req.body);

    const auction = await AuctionService.createAuction(payload);

    return res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      data: auction,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateAuctionStatus(req, res) {
  try {
    const id = validateAuctionId(req.params.id);
    const payload = validateUpdateAuctionStatus(req.body);

    const auction = await AuctionService.updateAuctionStatus(id, payload);

    return res.json({
      success: true,
      message: 'Auction status updated successfully',
      data: auction,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function cancelAuction(req, res) {
  try {
    const id = validateAuctionId(req.params.id);

    const auction = await AuctionService.cancelAuction(id);

    return res.json({
      success: true,
      message: 'Auction cancelled successfully',
      data: auction,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteAuction(req, res) {
  try {
    const id = validateAuctionId(req.params.id);

    await AuctionService.deleteAuction(id);

    return res.json({
      success: true,
      message: 'Auction deleted successfully',
    });
  } catch (error) {
    return handleError(res, error);
  }
}
 
module.exports = {
  getAuctions,
  getAuctionDetails,
  createAuction,
  updateAuctionStatus,
  cancelAuction,
  deleteAuction,
};