const prisma = require('../config/prisma');

const listingInclude = {
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
};

class ListingRepository {
  static listingInclude = listingInclude;

  static findBrandById(id) {
    return prisma.watchBrand.findUnique({
      where: { id },
    });
  }

  static findAdmins() {
    return prisma.user.findMany({
      where: {
        role: 'admin',
      },
    });
  }

  static findMany({ where, skip, take }) {
    return prisma.watchListing.findMany({
      where,
      skip,
      take,
      include: listingInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static findManyWithoutPagination(where = {}) {
    return prisma.watchListing.findMany({
      where,
      include: listingInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static count(where) {
    return prisma.watchListing.count({
      where,
    });
  }

  static findById(id) {
    return prisma.watchListing.findUnique({
      where: { id },
      include: listingInclude,
    });
  }

  static findRawById(id) {
    return prisma.watchListing.findUnique({
      where: { id },
    });
  }

  static findOwnedById(id, sellerId) {
    return prisma.watchListing.findFirst({
      where: {
        id,
        sellerId,
      },
      include: {
        images: true,
      },
    });
  }

  static createWithImages({ listingData, files }) {
    return prisma.$transaction(async (tx) => {
      const createdListing = await tx.watchListing.create({
        data: listingData,
      });

      if (files.length > 0) {
        await tx.watchImage.createMany({
          data: files.map((file, index) => ({
            watchListingId: createdListing.id,
            imageUrl: `/uploads/watches/${file.filename}`,
            sortOrder: index,
          })),
        });
      }

      return tx.watchListing.findUnique({
        where: {
          id: createdListing.id,
        },
        include: listingInclude,
      });
    });
  }

  static update(id, data) {
    return prisma.watchListing.update({
      where: { id },
      data,
      include: listingInclude,
    });
  }

  static delete(id) {
    return prisma.watchListing.delete({
      where: { id },
    });
  }

  static findLastImage(listingId) {
    return prisma.watchImage.findFirst({
      where: {
        watchListingId: listingId,
      },
      orderBy: {
        sortOrder: 'desc',
      },
    });
  }

  static createImages(imagesData) {
    return prisma.watchImage.createMany({
      data: imagesData,
    });
  }

  static findImages(listingId) {
    return prisma.watchImage.findMany({
      where: {
        watchListingId: listingId,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }
}

module.exports = ListingRepository;