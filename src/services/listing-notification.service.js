const NotificationType = require('../constants/notification-type');
const { sendPushToUser } = require('./notification.service');

class ListingNotificationService {
  static async approved(listing) {
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

  static async rejected(listing, reason = null) {
    return sendPushToUser({
      userId: listing.sellerId,
      title: 'Listing rejected',
      body: reason || 'Your watch listing was rejected.',
      type: NotificationType.LISTING_REJECTED,
      data: {
        listingId: listing.id.toString(),
      },
    });
  }

  static async statusChanged(listing, oldStatus, newStatus, rejectionReason = null) {
    if (oldStatus === newStatus) return;

    if (newStatus === 'approved') {
      await this.approved(listing);
    }

    if (newStatus === 'rejected') {
      await this.rejected(listing, rejectionReason);
    }
  }
}

module.exports = ListingNotificationService;