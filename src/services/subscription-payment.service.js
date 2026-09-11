const crypto = require('crypto');

const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');

const PackageRepository = require('../repositories/package.repository');
const SubscriptionRepository = require('../repositories/subscription.repository');
const SubscriptionPaymentRepository = require('../repositories/subscription-payment.repository');

class SubscriptionPaymentService {
  static format(data) {
    return serializeBigInt(data);
  }

  static buildDates(durationDays) {
    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + durationDays);

    return {
      startDate,
      endDate,
    };
  }

  static async createCheckout({ userId, packageId }) {
    const packageItem = await PackageRepository.findById(packageId);

    if (!packageItem || !packageItem.isActive) {
      throw new ApiError('Package not found', 404);
    }

    const { startDate, endDate } = this.buildDates(packageItem.durationDays);

    const subscription = await SubscriptionRepository.createPending({
      userId,
      packageId,
      startDate,
      endDate,
      maxListings: packageItem.maxListings,
      maxAuctionRequests: packageItem.maxAuctionRequests,
      featuredListings: packageItem.featuredListings,
      maxBids: packageItem.maxBids,
    });

    const payment = await SubscriptionPaymentRepository.create({
      subscriptionId: subscription.id,
      userId,
      amount: packageItem.price,
      currency: 'SAR',
      provider: 'simulation',
      status: 'pending',
    });

    return {
      subscription: this.format(subscription),
      payment: this.format(payment),
      checkoutUrl: null,
      simulation: true,
    };
  }

  static async simulateSuccess({ paymentId, userId }) {
    const payment = await SubscriptionPaymentRepository.findById(paymentId);

    if (!payment) {
      throw new ApiError('Payment not found', 404);
    }

    if (payment.userId.toString() !== userId.toString()) {
      throw new ApiError('You cannot access this payment', 403);
    }

    if (payment.status === 'success') {
      return {
        payment: this.format(payment),
        subscription: this.format(payment.subscription),
      };
    }

    if (payment.status !== 'pending') {
      throw new ApiError('Only pending payment can be completed', 422);
    }

    const transactionId = `SIM-${crypto.randomUUID()}`;

    const paidPayment = await SubscriptionPaymentRepository.markSuccess(
      payment.id,
      transactionId
    );

    const activatedSubscription = await SubscriptionRepository.activate(
      payment.subscriptionId,
      payment.subscription.package
    );

    return {
      payment: this.format(paidPayment),
      subscription: this.format(activatedSubscription),
    };
  }

  static async getPaymentDetails({ paymentId, userId }) {
    const payment = await SubscriptionPaymentRepository.findById(paymentId);

    if (!payment) {
      throw new ApiError('Payment not found', 404);
    }

    if (payment.userId.toString() !== userId.toString()) {
      throw new ApiError('You cannot access this payment', 403);
    }

    return this.format(payment);
  }
}

module.exports = SubscriptionPaymentService;