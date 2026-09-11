const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');
const BidRepository = require('../repositories/bid.repository');
const UserBidNotificationService = require('./user-bid-notification.service');
const SubscriptionLimitService = require('./subscription-limit.service');

class UserBidService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async getAuctionBids(auctionId) {
    const auction = await BidRepository.findAuctionById(auctionId);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    const bids = await BidRepository.findAuctionBids(auctionId);

    return this.format(bids);
  }

  static async createBid({ auctionId, userId, amount }) {
    await SubscriptionLimitService.checkBidLimit(userId);
    const auction = await BidRepository.findAuctionById(auctionId);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    const now = new Date();

    if (auction.status !== 'live') {
      throw new ApiError('Auction is not live', 409);
    }

    if (now < auction.startsAt || now > auction.endsAt) {
      throw new ApiError('Auction is not active now', 409);
    }

    if (auction.listing.sellerId.toString() === userId.toString()) {
      throw new ApiError('Seller cannot bid on own listing', 403);
    }

    const currentPrice = auction.currentPrice
      ? Number(auction.currentPrice)
      : Number(auction.startPrice);

    const bidIncrement = Number(auction.bidIncrement);
    const minimumBid = currentPrice + bidIncrement;

    if (amount < minimumBid) {
      throw new ApiError(`Minimum bid is ${minimumBid}`, 422);
    }

    const result = await BidRepository.createBidWithAuctionUpdate({
      auctionId,
      userId,
      amount,
    });

    await UserBidNotificationService.bidSubmitted(
      userId,
      result.auction,
      result.bid
    );

    if (
      result.previousWinningBid &&
      result.previousWinningBid.userId.toString() !== userId.toString()
    ) {
      await UserBidNotificationService.userOutbid(
        result.previousWinningBid,
        result.listing,
        result.auction
      );
    }

    await UserBidNotificationService.sellerNewBid(
      result.listing,
      result.auction
    );

    return {
      bid: this.format(result.bid),
      auction: this.format(result.auction),
    };
  }
}

module.exports = UserBidService;