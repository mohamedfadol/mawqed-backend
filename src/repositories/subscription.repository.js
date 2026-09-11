const prisma = require('../config/prisma');


const subscriptionInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  package: true,
};

class SubscriptionRepository {
  static findMany({ where = {}, skip, take }) {
    return prisma.subscription.findMany({
      where,
      skip,
      take,
      include: subscriptionInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static count(where = {}) {
    return prisma.subscription.count({
      where,
    });
  }

  static findById(id) {
    return prisma.subscription.findUnique({
      where: {
        id,
      },
      include: subscriptionInclude,
    });
  }

  static findActiveByUser(userId) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: {
          gte: new Date(),
        },
      },
      include: subscriptionInclude,
      orderBy: {
        endDate: 'desc',
      },
    });
  }

  static findUserSubscriptions(userId) {
    return prisma.subscription.findMany({
      where: {
        userId,
      },
      include: subscriptionInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static create(data) {
    return prisma.subscription.create({
      data,
      include: subscriptionInclude,
    });
  }

  static update(id, data) {
    return prisma.subscription.update({
      where: {
        id,
      },
      data,
      include: subscriptionInclude,
    });
  }

  static expireOldSubscriptions() {
    return prisma.subscription.updateMany({
      where: {
        status: 'active',
        endDate: {
          lt: new Date(),
        },
      },
      data: {
        status: 'expired',
      },
    });
  }

  static activate(id, packageItem) {
    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + packageItem.durationDays);

    return prisma.subscription.update({
      where: { id },
      data: {
        status: 'active',
        startDate,
        endDate,
      },
      include: subscriptionInclude,
    });
  }

  static createPending(data) {
    return prisma.subscription.create({
      data: {
        ...data,
        status: 'pending_payment',
      },
      include: subscriptionInclude,
    });
  }

  static incrementListingUsage(id) {
    return prisma.subscription.update({
      where: { id },
      data: {
        usedListings: {
          increment: 1,
        },
      },
    });
  }

  static incrementAuctionRequestUsage(id) {
    return prisma.subscription.update({
      where: { id },
      data: {
        usedAuctionRequests: {
          increment: 1,
        },
      },
    });
  }


    static decrementListingUsage(id) {
      return prisma.subscription.update({
          where: { id },
          data: {
          usedListings: {
              decrement: 1,
          },
          },
      });
  } 
  
}

module.exports = SubscriptionRepository;