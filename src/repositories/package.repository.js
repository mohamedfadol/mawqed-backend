const prisma = require('../config/prisma');

class PackageRepository {
  static findMany({ where = {}, skip, take }) {
    return prisma.package.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static count(where = {}) {
    return prisma.package.count({
      where,
    });
  }

  static findById(id) {
    return prisma.package.findUnique({
      where: {
        id,
      },
    });
  }

  static create(data) {
    return prisma.package.create({
      data,
    });
  }

  static update(id, data) {
    return prisma.package.update({
      where: {
        id,
      },
      data,
    });
  }

  static delete(id) {
    return prisma.package.delete({
      where: {
        id,
      },
    });
  }
}

module.exports = PackageRepository;