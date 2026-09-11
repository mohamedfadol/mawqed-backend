const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');
const BidRepository = require('../repositories/bid.repository');
const AuctionRepository = require('../repositories/auction.repository');

class BidService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async getBids({ page, limit, auctionId, userId, status }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (auctionId) {
      where.auctionId = auctionId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      BidRepository.findMany({
        where,
        skip,
        take: limit,
      }),
      BidRepository.count(where),
    ]);

    return {
      items: this.format(items),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getBidDetails(id) {
    const bid = await BidRepository.findById(id);

    if (!bid) {
      throw new ApiError('Bid not found', 404);
    }

    return this.format(bid);
  }

  static async createBid(payload) {
    const auction = await AuctionRepository.findRawById(payload.auctionId);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    if (auction.status !== 'live') {
      throw new ApiError('Auction is not live', 409);
    }

    const now = new Date();

    if (auction.endsAt && now > auction.endsAt) {
      throw new ApiError('Auction has ended', 409);
    }

    if (auction.startsAt && now < auction.startsAt) {
      throw new ApiError('Auction has not started yet', 409);
    }

    const currentPrice = Number(auction.currentPrice || auction.startPrice);
    const bidIncrement = Number(auction.bidIncrement || 1);
    const minimumAmount = currentPrice + bidIncrement;

    if (payload.amount < minimumAmount) {
      throw new ApiError(
        `Bid amount must be at least ${minimumAmount}`,
        422
      );
    }

    if (auction.listing?.sellerId === payload.userId) {
      throw new ApiError('Seller cannot bid on own auction', 409);
    }

    const bid = await BidRepository.createBidWithAuctionUpdate({
      auctionId: payload.auctionId,
      userId: payload.userId,
      amount: payload.amount,
    });

    return this.format(bid);
  }

  static async deleteBid(id) {
    const bid = await BidRepository.findById(id);

    if (!bid) {
      throw new ApiError('Bid not found', 404);
    }

    await BidRepository.delete(id);

    return true;
  }
}

module.exports = BidService;