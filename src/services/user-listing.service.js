const ApiError = require('../utils/api-error');
const { serializeBigInt, toBigInt } = require('../utils/serializer');
const ListingRepository = require('../repositories/listing.repository');
const UserListingNotificationService = require('./user-listing-notification.service');
const SubscriptionLimitService = require('./subscription-limit.service');

class UserListingService {
  static format(data) {
    return serializeBigInt(data);
  }

  static canModifyListing(listing, user) {
    return (
      listing.sellerId.toString() === String(user.id) ||
      user.role === 'admin'
    );
  }

  static async createListing({ payload, files, user }) {
    const subscription = await SubscriptionLimitService.checkListingLimit(payload.sellerId);
    const brand = await ListingRepository.findBrandById(payload.brandId);

    if (!brand) {
      throw new ApiError('Brand not found', 404);
    }

    const listing = await ListingRepository.createWithImages({
      listingData: payload,
      files,
    });

    
    try {
        await UserListingNotificationService.watchSubmitted(
          user.id,
          listing,
        );

        await UserListingNotificationService.newListingForAdmins(
          user,
          listing,
        );
      } catch (error) {
        console.error(error);
      }

    return this.format(listing);
  }

  static async submitToAuction({ listingId, user }) {
    const sellerId = toBigInt(user.id);

    const listing = await ListingRepository.findOwnedById(
      listingId,
      sellerId
    );

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    if (listing.status !== 'approved') {
      throw new ApiError(
        'Only approved listings can be submitted to auction',
        422
      );
    }

    if (!listing.images || listing.images.length === 0) {
      throw new ApiError(
        'Listing must have images before auction submission',
        422
      );
    }

    const subscription = await SubscriptionLimitService.checkAuctionRequestLimit(sellerId);

    const updatedListing = await ListingRepository.update(listing.id, {
      status: 'auction_requested',
    }); 

    await UserListingNotificationService.auctionRequestSubmitted(
      user.id,
      updatedListing
    );

    await UserListingNotificationService.auctionRequestForAdmins(
      user,
      updatedListing
    );

    return this.format(updatedListing);
  }

  static async getListings({ page, limit, status }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    const [listings, total] = await Promise.all([
      ListingRepository.findMany({
        where,
        skip,
        take: limit,
      }),
      ListingRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: this.format(listings),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  static async getListingsWithoutPagination() {
    const listings = await ListingRepository.findManyWithoutPagination();

    return this.format(listings);
  }

  static async getListingById(id) {
    const listing = await ListingRepository.findById(id);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    return this.format(listing);
  }

  static async updateListing({ id, user, data }) {
    const listing = await ListingRepository.findRawById(id);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    if (!this.canModifyListing(listing, user)) {
      throw new ApiError('You cannot update this listing', 403);
    }

    const oldStatus = listing.status;

    const updatedListing = await ListingRepository.update(id, data);

    if (user.role === 'admin' && data.status && data.status !== oldStatus) {
      await UserListingNotificationService.adminStatusChanged(
        updatedListing,
        oldStatus,
        data.status
      );
    }

    return this.format(updatedListing);
  }

  static async deleteListing({ id, user }) {
    const listing = await ListingRepository.findRawById(id);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    if (!this.canModifyListing(listing, user)) {
      throw new ApiError(
        'You cannot delete this listing',
        403
      );
    }

    const subscription =
      await SubscriptionLimitService.getActiveSubscriptionOrFail(
        listing.sellerId
      );

    await ListingRepository.delete(id);

    return true;
  }

  
  static async uploadListingImages({ id, user, files }) {
    const listing = await ListingRepository.findRawById(id);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    if (!this.canModifyListing(listing, user)) {
      throw new ApiError(
        'You cannot upload images for this listing',
        403
      );
    }

    const lastImage = await ListingRepository.findLastImage(id);

    let sortOrder = lastImage ? lastImage.sortOrder + 1 : 0;

    const imagesData = files.map((file) => ({
      watchListingId: id,
      imageUrl: `/uploads/watches/${file.filename}`,
      sortOrder: sortOrder++,
    }));

    await ListingRepository.createImages(imagesData);

    const images = await ListingRepository.findImages(id);

    return this.format(images);
  }
}

module.exports = UserListingService;