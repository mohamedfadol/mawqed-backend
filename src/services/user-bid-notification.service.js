const NotificationType = require('../constants/notification-type');
const { sendPushToUser } = require('./notification.service');

class UserBidNotificationService {
  static async bidSubmitted(userId, auction, bid) {
    return sendPushToUser({
      userId,
      title: 'Bid submitted',
      body: 'Your bid has been placed successfully.',
      type: NotificationType.BID_CREATED,
      data: {
        auctionId: auction.id.toString(),
        bidId: bid.id.toString(),
      },
    });
  }

  static async userOutbid(previousWinningBid, listing, auction) {
    return sendPushToUser({
      userId: previousWinningBid.userId,
      title: 'You have been outbid',
      body: `Someone placed a higher bid on ${listing.title}.`,
      type: NotificationType.BID_OUTBID,
      data: {
        auctionId: auction.id.toString(),
        bidId: previousWinningBid.id.toString(),
      },
    });
  }

  static async sellerNewBid(listing, auction) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'New bid received',
      body: `A new bid was placed on ${listing.title}.`,
      type: NotificationType.SELLER_NEW_BID,
      data: {
        auctionId: auction.id.toString(),
        listingId: listing.id.toString(),
      },
    });
  }
}

module.exports = UserBidNotificationService;