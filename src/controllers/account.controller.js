const AccountService = require('../services/account.service');
const { validateUserId } = require('../validations/account.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getMyBids(req, res) {
  try {
    const userId = validateUserId(req.user);

    const bids = await AccountService.getMyBids(userId);

    return res.json({
      success: true,
      data: bids,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getWonAuctions(req, res) {
  try {
    const userId = validateUserId(req.user);

    const auctions = await AccountService.getWonAuctions(userId);

    return res.json({
      success: true,
      data: auctions,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getSelling(req, res) {
  try {
    const userId = validateUserId(req.user);

    const listings = await AccountService.getSelling(userId);

    return res.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getMyBids,
  getWonAuctions,
  getSelling,
};