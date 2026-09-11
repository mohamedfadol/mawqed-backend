const prisma = require('../config/prisma');
const ApiError = require('../utils/api-error');
const SubscriptionRepository = require('../repositories/subscription.repository');

class SubscriptionLimitService {

  static async getActiveSubscriptionOrFail(userId) {
    const subscription =
      await SubscriptionRepository.findActiveByUser(userId);

    if (!subscription) {
      throw new ApiError(
        'Active subscription required. Please choose a package.',
        403
      );
    }

    return subscription;
  }

  static async checkListingLimit(userId) {
    const subscription =
      await this.getActiveSubscriptionOrFail(userId);

    const listingsCount = await prisma.watchListing.count({
      where: {
        sellerId: userId,
      },
    });

    if (
      subscription.maxListings !== null &&
      subscription.maxListings !== undefined &&
      listingsCount >= subscription.maxListings
    ) {
      throw new ApiError(
        `Listing limit reached. Your package allows ${subscription.maxListings} listings.`,
        403
      );
    }

    return subscription;
  }

  static async checkAuctionRequestLimit(userId) {
    const subscription =
      await this.getActiveSubscriptionOrFail(userId);

    const auctionRequestsCount =
      await prisma.watchListing.count({
        where: {
          sellerId: userId,
          status: {
            in: ['auction_requested', 'sold'],
          },
        },
      });

    if (
      subscription.maxAuctionRequests !== null &&
      subscription.maxAuctionRequests !== undefined &&
      auctionRequestsCount >= subscription.maxAuctionRequests
    ) {
      throw new ApiError(
        `Auction request limit reached. Your package allows ${subscription.maxAuctionRequests} auction requests.`,
        403
      );
    }

    return subscription;
  }

  static async incrementListingUsage(subscriptionId) {
    return SubscriptionRepository.incrementListingUsage(subscriptionId);
  }

  static async checkBidLimit(userId) {
    const subscription =
        await this.getActiveSubscriptionOrFail(userId);

    const bidsCount = await prisma.bid.count({
        where: {
        userId,
        createdAt: {
            gte: subscription.startDate,
            lte: subscription.endDate,
        },
        },
    });

    if (
        subscription.maxBids !== null &&
        subscription.maxBids !== undefined &&
        bidsCount >= subscription.maxBids
    ) {
        throw new ApiError(
        `Bid limit reached. Your package allows ${subscription.maxBids} bids.`,
        403
        );
    }

    return subscription;
    }

  static async incrementAuctionRequestUsage(subscriptionId) {
    return SubscriptionRepository.incrementAuctionRequestUsage(subscriptionId);
  }

    static async decrementListingUsage(subscriptionId) {
    return SubscriptionRepository.decrementListingUsage(
        subscriptionId
    );
    }
}

module.exports = SubscriptionLimitService;