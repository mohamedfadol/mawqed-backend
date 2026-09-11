const prisma = require('../config/prisma');
const logger = require('../utils/logger');

function toBigInt(id) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

function formatImage(image) {
  return {
    id: image.id.toString(),
    watchListingId: image.watchListingId.toString(),
    imageUrl: image.imageUrl,
    sortOrder: image.sortOrder,
  };
}

function formatBid(bid) {
  return {
    id: bid.id.toString(),
    auctionId: bid.auctionId.toString(),
    userId: bid.userId.toString(),
    amount: bid.amount.toString(),
    status: bid.status,
    createdAt: bid.createdAt,
  };
}

function formatListing(listing) {
  if (!listing) return null;

  return {
    id: listing.id.toString(),
    sellerId: listing.sellerId?.toString() ?? null,
    brandId: listing.brandId?.toString() ?? null,
    title: listing.title,
    referenceNumber: listing.referenceNumber,
    productionYear: listing.productionYear,
    conditionStatus: listing.conditionStatus,
    hasOriginalBox: listing.hasOriginalBox,
    hasPapers: listing.hasPapers,
    hasServiceHistory: listing.hasServiceHistory,
    description: listing.description,
    reservePrice: listing.reservePrice
      ? listing.reservePrice.toString()
      : null,
    estimatedPrice: listing.estimatedPrice
      ? listing.estimatedPrice.toString()
      : null,
    status: listing.status,

    brand: listing.brand
      ? {
          id: listing.brand.id.toString(),
          nameEn: listing.brand.nameEn,
          nameAr: listing.brand.nameAr,
          slug: listing.brand.slug,
          status: listing.brand.status,
        }
      : null,

    images: Array.isArray(listing.images)
      ? listing.images.map(formatImage)
      : [],
  };
}

function formatAuction(auction) {
  return {
    id: auction.id.toString(),
    watchListingId: auction.watchListingId.toString(),
    winnerUserId: auction.winnerUserId
      ? auction.winnerUserId.toString()
      : null,
    startPrice: auction.startPrice.toString(),
    currentPrice: auction.currentPrice
      ? auction.currentPrice.toString()
      : null,
    bidIncrement: auction.bidIncrement.toString(),
    startsAt: auction.startsAt,
    endsAt: auction.endsAt,
    status: auction.status,
    createdAt: auction.createdAt,
    updatedAt: auction.updatedAt,

    listing: formatListing(auction.listing),

    bids: Array.isArray(auction.bids)
      ? auction.bids.map(formatBid)
      : [],
  };
}

async function getAuctions(req, res) {
  try {
    const { status } = req.query;

    const allowedStatuses = [
      'live',
      'scheduled',
      'ended',
      'cancelled',
    ];

    const where = {};

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(422).json({
          success: false,
          message: 'Invalid auction status',
        });
      }

      where.status = status;
    }

    const auctions = await prisma.auction.findMany({
      where,
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
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 10,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: auctions.map(formatAuction),
    });
  } catch (error) {
    logger.error('Get auctions error', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function getAuctionById(req, res) {
  try {
    const id = toBigInt(req.params.id);

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'Invalid auction id',
      });
    }

    const auction = await prisma.auction.findUnique({
      where: { id },
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
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found',
      });
    }

    return res.json({
      success: true,
      data: {
        auction: formatAuction(auction),
      },
    });
  } catch (error) {
    logger.error('Get auction details error', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

module.exports = {
  getAuctions,
  getAuctionById,
};