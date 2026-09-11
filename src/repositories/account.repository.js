const prisma = require('../config/prisma');

const listingInclude = {
  brand: true,
  images: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
};

class AccountRepository {
  static findMyBids(userId) {
    return prisma.bid.findMany({
      where: {
        userId,
      },
      include: {
        auction: {
          include: {
            listing: {
              include: listingInclude,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static findWonAuctions(userId) {
    return prisma.auction.findMany({
      where: {
        winnerUserId: userId,
        status: 'ended',
      },
      include: {
        listing: {
          include: listingInclude,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  static findSelling(userId) {
    return prisma.watchListing.findMany({
      where: {
        sellerId: userId,
      },
      include: {
        ...listingInclude,
        auction: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = AccountRepository;