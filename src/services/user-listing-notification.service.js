const NotificationType = require('../constants/notification-type');
const { sendPushToUser } = require('./notification.service');
const ListingRepository = require('../repositories/listing.repository');

class UserListingNotificationService {
  static async watchSubmitted(userId, listing) {
    return sendPushToUser({
      userId,
      title: 'Watch submitted',
      body: 'Your watch has been submitted for review.',
      type: NotificationType.WATCH_CREATED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async auctionRequestSubmitted(userId, listing) {
    return sendPushToUser({
      userId,
      title: 'Auction request submitted',
      body: 'Your watch has been submitted to auction review.',
      type: NotificationType.AUCTION_REQUESTED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async listingApproved(listing) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Listing approved',
      body: 'Your watch listing has been approved.',
      type: NotificationType.LISTING_APPROVED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async listingRejected(listing) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Listing rejected',
      body: 'Your watch listing was rejected.',
      type: NotificationType.LISTING_REJECTED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async notifyAdmins({ title, body, type, data }) {
    const admins = await ListingRepository.findAdmins();

    for (const admin of admins) {
      await sendPushToUser({
        userId: admin.id,
        title,
        body,
        type,
        data,
      });
    }
  }

  static async newListingForAdmins(user, listing) {
    return this.notifyAdmins({
      title: 'New watch submitted',
      body: `${user.name ?? 'Seller'} submitted a watch.`,
      type: NotificationType.ADMIN_NEW_LISTING,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async auctionRequestForAdmins(user, listing) {
    return this.notifyAdmins({
      title: 'Auction review requested',
      body: `${user.name ?? 'Seller'} submitted a watch for auction review.`,
      type: NotificationType.AUCTION_REQUESTED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async adminStatusChanged(listing, oldStatus, newStatus) {
    if (oldStatus === newStatus) return;

    if (newStatus === 'approved') {
      await this.listingApproved(listing);
    }

    if (newStatus === 'rejected') {
      await this.listingRejected(listing);
    }
  }
}

module.exports = UserListingNotificationService;