const prisma = require('../config/prisma');
const AuctionNotificationService = require('../services/auction-notification.service');

function toBigInt(id) {
  try {
    return BigInt(id);
  } catch {
    return null;
  }
}

function formatAuction(auction) {
  return {
    ...auction,
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
  };
}

function formatListing(listing) {
  return {
    ...listing,
    id: listing.id.toString(),
    sellerId: listing.sellerId.toString(),
    brandId: listing.brandId.toString(),
    reservePrice: listing.reservePrice
      ? listing.reservePrice.toString()
      : null,
    estimatedPrice: listing.estimatedPrice
      ? listing.estimatedPrice.toString()
      : null,
  };
}

async function approveListing(req, res) {
  try {
    const id = toBigInt(req.params.id);

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'Invalid listing id',
      });
    }

    const listing = await prisma.watchListing.update({
      where: { id },
      data: { status: 'approved' },
    });

    await AuctionNotificationService.listingApproved(listing);

    return res.json({
      success: true,
      message: 'Listing approved successfully',
      data: {
        listing: formatListing(listing),
      },
    });
  } catch (error) {
    console.error('Approve listing error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function rejectListing(req, res) {
  try {
    const id = toBigInt(req.params.id);

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'Invalid listing id',
      });
    }

    const listing = await prisma.watchListing.update({
      where: { id },
      data: { status: 'rejected' },
    });

    await AuctionNotificationService.listingRejected(listing);

    return res.json({
      success: true,
      message: 'Listing rejected successfully',
      data: {
        listing: formatListing(listing),
      },
    });
  } catch (error) {
    console.error('Reject listing error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function createAuction(req, res) {
  try {
    const {
      watchListingId,
      startPrice,
      bidIncrement,
      startsAt,
      endsAt,
    } = req.body || {};

    if (!watchListingId || !startPrice || !startsAt || !endsAt) {
      return res.status(422).json({
        success: false,
        message: 'watchListingId, startPrice, startsAt and endsAt are required',
      });
    }

    const listingId = toBigInt(watchListingId);

    if (!listingId) {
      return res.status(422).json({
        success: false,
        message: 'Invalid watchListingId',
      });
    }

    const listing = await prisma.watchListing.findUnique({
      where: { id: listingId },
      include: {
        auction: true,
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    if (
      listing.status !== 'approved' &&
      listing.status !== 'auction_requested'
    ) {
      return res.status(409).json({
        success: false,
        message: 'Listing must be approved or auction requested before creating auction',
      });
    }

    if (listing.auction) {
      return res.status(409).json({
        success: false,
        message: 'Auction already exists for this listing',
      });
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(422).json({
        success: false,
        message: 'Invalid startsAt or endsAt date',
      });
    }

    if (endDate <= startDate) {
      return res.status(422).json({
        success: false,
        message: 'endsAt must be after startsAt',
      });
    }

    const now = new Date();
    const status = now >= startDate && now <= endDate ? 'live' : 'scheduled';

    const auction = await prisma.$transaction(async (tx) => {
      const createdAuction = await tx.auction.create({
        data: {
          watchListingId: listingId,
          startPrice: Number(startPrice),
          currentPrice: Number(startPrice),
          bidIncrement: bidIncrement ? Number(bidIncrement) : 1000,
          startsAt: startDate,
          endsAt: endDate,
          status,
        },
      });

      await tx.watchListing.update({
        where: { id: listingId },
        data: {
          status: 'in_auction',
        },
      });

      return createdAuction;
    });

    await AuctionNotificationService.auctionCreated(listing, auction);

    return res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      data: {
        auction: formatAuction(auction),
      },
    });
  } catch (error) {
    console.error('Create auction error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function updateAuctionStatus(req, res) {
  try {
    const id = toBigInt(req.params.id);
    const { status } = req.body || {};

    const allowed = ['scheduled', 'live', 'ended', 'cancelled'];

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'Invalid auction id',
      });
    }

    if (!status) {
      return res.status(422).json({
        success: false,
        message: 'status is required',
      });
    }

    if (!allowed.includes(status)) {
      return res.status(422).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found',
      });
    }

    const data = { status };
    let winningBid = null;

    if (status === 'ended') {
      winningBid = await prisma.bid.findFirst({
        where: {
          auctionId: id,
          status: 'winning',
        },
        orderBy: {
          amount: 'desc',
        },
      });

      if (winningBid) {
        data.winnerUserId = winningBid.userId;
      }
    }

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data,
    });

    if (status === 'live') {
      await AuctionNotificationService.auctionStarted(
        auction.listing,
        auction
      );
    }

    if (status === 'ended') {
      await AuctionNotificationService.auctionEnded(
        auction.listing,
        auction
      );

      if (winningBid) {
        await AuctionNotificationService.bidWon(
          winningBid.userId,
          auction.listing,
          auction
        );
      }
    }

    return res.json({
      success: true,
      message: 'Auction status updated successfully',
      data: {
        auction: formatAuction(updatedAuction),
      },
    });
  } catch (error) {
    console.error('Update auction status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

module.exports = {
  approveListing,
  rejectListing,
  createAuction,
  updateAuctionStatus,
};