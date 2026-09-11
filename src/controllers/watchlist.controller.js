const WatchlistService = require('../services/watchlist.service');

const {
  validateAuctionId,
  validateUserId,
} = require('../validations/watchlist.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function addToWatchlist(req, res) {
  try {
    const auctionId = validateAuctionId(req.params.id);
    const userId = validateUserId(req.user);

    const watchlist = await WatchlistService.addToWatchlist({
      userId,
      auctionId,
    });

    return res.status(201).json({
      success: true,
      message: 'Auction added to watchlist',
      data: {
        watchlist,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function removeFromWatchlist(req, res) {
  try {
    const auctionId = validateAuctionId(req.params.id);
    const userId = validateUserId(req.user);

    await WatchlistService.removeFromWatchlist({
      userId,
      auctionId,
    });

    return res.json({
      success: true,
      message: 'Auction removed from watchlist',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMyWatchlist(req, res) {
  try {
    const userId = validateUserId(req.user);

    const watchlist = await WatchlistService.getMyWatchlist(userId);

    return res.json({
      success: true,
      data: watchlist,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
};