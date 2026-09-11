const UserBidService = require('../services/user-bid.service');

const {
  validateAuctionId,
  validateCreateBid,
} = require('../validations/user-bid.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getAuctionBids(req, res) {
  try {
    const auctionId = validateAuctionId(req.params.id);

    const bids = await UserBidService.getAuctionBids(auctionId);

    return res.json({
      success: true,
      data: bids,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function createBid(req, res) {
  try {
    const auctionId = validateAuctionId(req.params.id);
    const payload = validateCreateBid(req.body, req.user);

    const result = await UserBidService.createBid({
      auctionId,
      userId: payload.userId,
      amount: payload.amount,
    });

    return res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getAuctionBids,
  createBid,
};