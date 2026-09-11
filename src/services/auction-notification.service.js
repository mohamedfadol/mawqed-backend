const NotificationType = require('../constants/notification-type');
const { sendPushToUser } = require('./notification.service');

class AuctionNotificationService {
  static async listingApproved(listing) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Listing Approved',
      body: `${listing.title} has been approved.`,
      type: NotificationType.LISTING_APPROVED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async listingRejected(listing) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Listing Rejected',
      body: `${listing.title} has been rejected.`,
      type: NotificationType.LISTING_REJECTED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async auctionCreated(listing, auction) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Auction Created',
      body: `${listing.title} has been scheduled for auction.`,
      type: NotificationType.AUCTION_CREATED,
      data: {
        auctionId: auction.id.toString(),
        listingId: listing.id.toString(),
      },
    });
  }

  static async auctionStarted(listing, auction) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Auction Started',
      body: `${listing.title} is now live.`,
      type: NotificationType.AUCTION_STARTED,
      data: {
        auctionId: auction.id.toString(),
        listingId: listing.id.toString(),
      },
    });
  }

  static async auctionEnded(listing, auction) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Auction Ended',
      body: `${listing.title} auction has ended.`,
      type: NotificationType.AUCTION_ENDED,
      data: {
        auctionId: auction.id.toString(),
        listingId: listing.id.toString(),
      },
    });
  }

  static async bidWon(userId, listing, auction) {
    return sendPushToUser({
      userId,
      title: 'You Won the Auction',
      body: `You won the auction for ${listing.title}.`,
      type: NotificationType.BID_WON,
      data: {
        auctionId: auction.id.toString(),
        listingId: listing.id.toString(),
      },
    });
  }
}

module.exports = AuctionNotificationService;