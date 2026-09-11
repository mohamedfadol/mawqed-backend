const BidService = require('../services/bid.service');

const {
  validateBidId,
  validateCreateBid,
  validateBidQuery,
} = require('../validations/bid.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getBids(req, res) {
  try {
    const query = validateBidQuery(req.query);

    const result = await BidService.getBids(query);

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getBidDetails(req, res) {
  try {
    const id = validateBidId(req.params.id);

    const bid = await BidService.getBidDetails(id);

    return res.json({
      success: true,
      data: bid,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function createBid(req, res) {
  try {
    const payload = validateCreateBid(req.body, req.user);

    const bid = await BidService.createBid(payload);

    return res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: bid,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteBid(req, res) {
  try {
    const id = validateBidId(req.params.id);

    await BidService.deleteBid(id);

    return res.json({
      success: true,
      message: 'Bid deleted successfully',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getBids,
  getBidDetails,
  createBid,
  deleteBid,
};