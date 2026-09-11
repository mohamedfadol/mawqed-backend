const prisma = require('../config/prisma');

const bidInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  auction: {
    include: {
      listing: true,
    },
  },
};

const bidUserInclude = {
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

class BidRepository {

     static findAuctionById(id) {
      return prisma.auction.findUnique({
        where: { id },
        include: {
          listing: true,
        },
      });
    }

   static findAuctionBids(auctionId) {
    return prisma.bid.findMany({
      where: { auctionId },
      include: bidUserInclude,
      orderBy: {
        amount: 'desc',
      },
    });
  }
  
  static findMany({ where, skip, take }) {
    return prisma.bid.findMany({
      where,
      skip,
      take,
      include: bidInclude,
      orderBy: {
        amount: 'desc',
      },
    });
  }

  static count(where) {
    return prisma.bid.count({ where });
  }

  static findById(id) {
    return prisma.bid.findUnique({
      where: { id },
      include: bidInclude,
    });
  }


  static findAuctionBids(auctionId) {
    return prisma.bid.findMany({
      where: { auctionId },
      include: bidInclude,
      orderBy: {
        amount: 'desc',
      },
    });
  }
  
  static findHighestBid(auctionId) {
    return prisma.bid.findFirst({
      where: {
        auctionId,
      },
      orderBy: {
        amount: 'desc',
      },
    });
  }

  static createBidWithAuctionUpdate({ auctionId, userId, amount }) {
    return prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          listing: true,
        },
      });

      const previousWinningBid = await tx.bid.findFirst({
        where: {
          auctionId,
          status: 'winning',
        },
        orderBy: {
          amount: 'desc',
        },
      });

      await tx.bid.updateMany({
        where: {
          auctionId,
          status: 'winning',
        },
        data: {
          status: 'outbid',
        },
      });

      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId,
          amount,
          status: 'winning',
        },
        include: bidInclude,
      });

      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: amount,
        },
      });

      return {
        bid,
        auction: updatedAuction,
        listing: auction.listing,
        previousWinningBid,
      };
    });
  }
 

  static update(id, data) {
    return prisma.bid.update({
      where: { id },
      data,
      include: bidInclude,
    });
  }

  static delete(id) {
    return prisma.bid.delete({
      where: { id },
    });
  }
}

module.exports = BidRepository;