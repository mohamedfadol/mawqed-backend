const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');

const PackageRepository = require('../repositories/package.repository');
const SubscriptionRepository = require('../repositories/subscription.repository');

class SubscriptionService {
  static format(data) {
    return serializeBigInt(data);
  }

  static buildSubscriptionData({ userId, packageItem, status = 'active' }) {
    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + packageItem.durationDays);

    return {
      userId,
      packageId: packageItem.id,
      startDate,
      endDate,
      status,
      maxListings: packageItem.maxListings,
      maxAuctionRequests: packageItem.maxAuctionRequests,
      featuredListings: packageItem.featuredListings,
    };
  }

  static async getSubscriptions({ page, limit, userId, packageId, status }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (userId) where.userId = userId;
    if (packageId) where.packageId = packageId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      SubscriptionRepository.findMany({
        where,
        skip,
        take: limit,
      }),
      SubscriptionRepository.count(where),
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

  static async getSubscriptionDetails(id) {
    const subscription = await SubscriptionRepository.findById(id);

    if (!subscription) {
      throw new ApiError('Subscription not found', 404);
    }

    return this.format(subscription);
  }

  static async createSubscriptionByAdmin(payload) {
    const packageItem = await PackageRepository.findById(payload.packageId);

    if (!packageItem) {
      throw new ApiError('Package not found', 404);
    }

    const subscriptionData = this.buildSubscriptionData({
      userId: payload.userId,
      packageItem,
      status: payload.status,
    });

    const subscription = await SubscriptionRepository.create(subscriptionData);

    return this.format(subscription);
  }

  static async subscribeToPackage(payload) {
    const packageItem = await PackageRepository.findById(payload.packageId);

    if (!packageItem || !packageItem.isActive) {
      throw new ApiError('Package not found', 404);
    }

    const subscriptionData = this.buildSubscriptionData({
      userId: payload.userId,
      packageItem,
      status: 'pending_payment',
    });

    const subscription = await SubscriptionRepository.create(subscriptionData);

    return this.format(subscription);
  }

  static async getMySubscriptions(userId) {
    const subscriptions =
      await SubscriptionRepository.findUserSubscriptions(userId);

    return this.format(subscriptions);
  }

  static async getMyActiveSubscription(userId) {
    const subscription = await SubscriptionRepository.findActiveByUser(userId);

    return this.format(subscription);
  }

  static async updateSubscriptionStatus(id, payload) {
    const subscription = await SubscriptionRepository.findById(id);

    if (!subscription) {
      throw new ApiError('Subscription not found', 404);
    }

    const updated = await SubscriptionRepository.update(id, {
      status: payload.status,
    });

    return this.format(updated);
  }

  static async cancelMySubscription({ id, userId }) {
    const subscription = await SubscriptionRepository.findById(id);

    if (!subscription) {
      throw new ApiError('Subscription not found', 404);
    }

    if (subscription.userId.toString() !== userId.toString()) {
      throw new ApiError('You cannot cancel this subscription', 403);
    }

    if (subscription.status !== 'active') {
      throw new ApiError('Only active subscription can be cancelled', 422);
    }

    const updated = await SubscriptionRepository.update(id, {
      status: 'cancelled',
    });

    return this.format(updated);
  }

  static async expireOldSubscriptions() {
    return SubscriptionRepository.expireOldSubscriptions();
  }
}

module.exports = SubscriptionService;