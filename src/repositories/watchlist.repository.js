const prisma = require('../config/prisma');

const watchlistInclude = {
  auction: {
    include: {
      listing: {
        include: {
          brand: true,
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      },
    },
  },
};

class WatchlistRepository {
  static findAuctionById(auctionId) {
    return prisma.auction.findUnique({
      where: {
        id: auctionId,
      },
    });
  }

  static findByUserAndAuction(userId, auctionId) {
    return prisma.watchlist.findUnique({
      where: {
        userId_auctionId: {
          userId,
          auctionId,
        },
      },
      include: watchlistInclude,
    });
  }

  static create(userId, auctionId) {
    return prisma.watchlist.create({
      data: {
        userId,
        auctionId,
      },
      include: watchlistInclude,
    });
  }

  static delete(userId, auctionId) {
    return prisma.watchlist.delete({
      where: {
        userId_auctionId: {
          userId,
          auctionId,
        },
      },
    });
  }

  static findUserWatchlist(userId) {
    return prisma.watchlist.findMany({
      where: {
        userId,
      },
      include: watchlistInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

module.exports = WatchlistRepository;