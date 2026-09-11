const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');
const WatchlistRepository = require('../repositories/watchlist.repository');

class WatchlistService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async addToWatchlist({ userId, auctionId }) {
    const auction = await WatchlistRepository.findAuctionById(auctionId);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    const existing = await WatchlistRepository.findByUserAndAuction(
      userId,
      auctionId
    );

    if (existing) {
      throw new ApiError('Auction already in watchlist', 409);
    }

    const watchlist = await WatchlistRepository.create(userId, auctionId);

    return this.format(watchlist);
  }

  static async removeFromWatchlist({ userId, auctionId }) {
    const existing = await WatchlistRepository.findByUserAndAuction(
      userId,
      auctionId
    );

    if (!existing) {
      throw new ApiError('Auction not found in watchlist', 404);
    }

    await WatchlistRepository.delete(userId, auctionId);

    return true;
  }

  static async getMyWatchlist(userId) {
    const watchlist = await WatchlistRepository.findUserWatchlist(userId);

    return this.format(watchlist);
  }
}

module.exports = WatchlistService;