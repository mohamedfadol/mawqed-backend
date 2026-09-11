const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');
const prisma = require('../config/prisma');

const AuctionRepository = require('../repositories/auction.repository');
const ListingRepository = require('../repositories/listing.repository');
const AuctionNotificationService = require('./auction-notification.service');

class AuctionService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async getAuctions({ status, page, limit }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      AuctionRepository.findMany({
        where,
        skip,
        take: limit,
      }),
      AuctionRepository.count(where),
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

  static async getAuctionDetails(id) {
    const auction = await AuctionRepository.findById(id);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    return this.format(auction);
  }

  static async createAuction(payload) {
    const listing = await ListingRepository.findRawById(payload.listingId);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    if (
      listing.status !== 'approved' &&
      listing.status !== 'auction_requested'
    ) {
      throw new ApiError(
        'Listing must be approved or auction requested before creating auction',
        409
      );
    }

    const existingAuction = await AuctionRepository.findByListingId(
      payload.listingId
    );

    if (existingAuction) {
      throw new ApiError('Auction already exists for this listing', 409);
    }

    const now = new Date();

    const status =
      now >= payload.startsAt && now <= payload.endsAt
        ? 'live'
        : 'scheduled';

    const auction = await AuctionRepository.createWithListingUpdate({
      listingId: payload.listingId,
      auctionData: {
        watchListingId: payload.listingId,
        startPrice: payload.startPrice,
        currentPrice: payload.startPrice,
        bidIncrement: payload.bidIncrement,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        status,
      },
    });

    await AuctionNotificationService.auctionCreated(listing, auction);

    return this.format(auction);
  }

  static async updateAuctionStatus(id, payload) {
    const auction = await AuctionRepository.findRawById(id);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    const data = {
      status: payload.status,
    };

    let winningBid = null;

    if (payload.status === 'ended') {
      winningBid = await prisma.bid.findFirst({
        where: {
          auctionId: id,
          status: 'winning',
        },
        orderBy: {
          amount: 'desc',
        },
      });

      if (!winningBid) {
        winningBid = await prisma.bid.findFirst({
          where: {
            auctionId: id,
          },
          orderBy: {
            amount: 'desc',
          },
        });
      }

      if (winningBid) {
        data.winnerUserId = winningBid.userId;
      }
    }

    const updatedAuction = await AuctionRepository.update(id, data);

    if (payload.status === 'live') {
      await AuctionNotificationService.auctionStarted(
        auction.listing,
        auction
      );
    }

    if (payload.status === 'ended') {
      await AuctionNotificationService.auctionEnded(
        auction.listing,
        auction
      );

      if (winningBid) {
        await AuctionNotificationService.bidWon(
          winningBid.userId,
          auction.listing,
          auction
        );
      }
    }

    return this.format(updatedAuction);
  }

  static async cancelAuction(id) {
    const auction = await AuctionRepository.findRawById(id);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    if (auction.status === 'ended') {
      throw new ApiError('Ended auction cannot be cancelled', 409);
    }

    const updatedAuction = await AuctionRepository.update(id, {
      status: 'cancelled',
    });

    return this.format(updatedAuction);
  }

  static async deleteAuction(id) {
    const auction = await AuctionRepository.findRawById(id);

    if (!auction) {
      throw new ApiError('Auction not found', 404);
    }

    await AuctionRepository.delete(id);

    return true;
  }
}

module.exports = AuctionService;