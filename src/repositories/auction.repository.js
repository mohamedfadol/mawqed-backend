const prisma = require('../config/prisma');

const auctionInclude = {
  listing: {
    include: {
      brand: true,
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  bids: {
    orderBy: {
      amount: 'desc',
    },
    take: 1,
  },
};

const auctionDetailsInclude = {
  listing: {
    include: {
      brand: true,
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  },
  bids: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      amount: 'desc',
    },
  },
};

class AuctionRepository {
  static findMany({ where, skip, take }) {
    return prisma.auction.findMany({
      where,
      skip,
      take,
      include: auctionInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static count(where) {
    return prisma.auction.count({ where });
  }

  static findById(id) {
    return prisma.auction.findUnique({
      where: { id },
      include: auctionDetailsInclude,
    });
  }

  static findRawById(id) {
    return prisma.auction.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });
  }

  static findByListingId(watchListingId) {
    return prisma.auction.findUnique({
      where: {
        watchListingId,
      },
    });
  }

  static createWithListingUpdate({ listingId, auctionData }) {
    return prisma.$transaction(async (tx) => {
      const auction = await tx.auction.create({
        data: auctionData,
      });

      await tx.watchListing.update({
        where: {
          id: listingId,
        },
        data: {
          status: 'in_auction',
        },
      });

      return auction;
    });
  }

  static update(id, data) {
    return prisma.auction.update({
      where: { id },
      data,
      include: auctionDetailsInclude,
    });
  }

  static delete(id) {
    return prisma.auction.delete({
      where: { id },
    });
  }
}

module.exports = AuctionRepository;