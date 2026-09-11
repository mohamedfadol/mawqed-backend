const prisma = require('../config/prisma');

const paymentInclude = {
  subscription: {
    include: {
      package: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
};

class SubscriptionPaymentRepository {
  static create(data) {
    return prisma.subscriptionPayment.create({
      data,
      include: paymentInclude,
    });
  }

  static findById(id) {
    return prisma.subscriptionPayment.findUnique({
      where: { id },
      include: paymentInclude,
    });
  }

  static findBySubscription(subscriptionId) {
    return prisma.subscriptionPayment.findFirst({
      where: { subscriptionId },
      include: paymentInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static markSuccess(id, transactionId = null) {
    return prisma.subscriptionPayment.update({
      where: { id },
      data: {
        status: 'success',
        transactionId,
        paidAt: new Date(),
      },
      include: paymentInclude,
    });
  }

  static markFailed(id) {
    return prisma.subscriptionPayment.update({
      where: { id },
      data: {
        status: 'failed',
      },
      include: paymentInclude,
    });
  }
}

module.exports = SubscriptionPaymentRepository;