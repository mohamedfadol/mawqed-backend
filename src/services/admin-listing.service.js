const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');
const ListingRepository = require('../repositories/listing.repository');
const ListingNotificationService = require('./listing-notification.service');

class AdminListingService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async getListings({ status, page, limit }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      ListingRepository.findMany({
        where,
        skip,
        take: limit,
      }),
      ListingRepository.count(where),
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

  static async getListingDetails(id) {
    const listing = await ListingRepository.findById(id);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    return this.format(listing);
  }

  static async updateListingStatus(id, payload) {
    const oldListing = await ListingRepository.findRawById(id);

    if (!oldListing) {
      throw new ApiError('Listing not found', 404);
    }

    const listing = await ListingRepository.updateStatus(id, {
      status: payload.status,
      rejectionReason:
        payload.status === 'rejected'
          ? payload.rejectionReason
          : null,
    });

    await ListingNotificationService.statusChanged(
      listing,
      oldListing.status,
      payload.status,
      payload.rejectionReason
    );

    return this.format(listing);
  }

  static async deleteListing(id) {
    const listing = await ListingRepository.findRawById(id);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    await ListingRepository.delete(id);

    return true;
  }
}

module.exports = AdminListingService;