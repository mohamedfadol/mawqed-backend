const ApiError = require('../utils/api-error');
const { serializeBigInt } = require('../utils/serializer');
const PackageRepository = require('../repositories/package.repository');

class PackageService {
  static format(data) {
    return serializeBigInt(data);
  }

  static async getPackages({ page, limit, isActive }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [items, total] = await Promise.all([
      PackageRepository.findMany({
        where,
        skip,
        take: limit,
      }),
      PackageRepository.count(where),
    ]);

    return {
      items: this.format(items),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getActivePackages() {
    const packages = await PackageRepository.findMany({
      where: {
        isActive: true,
      },
    });

    return this.format(packages);
  }

  static async getPackageDetails(id) {
    const packageItem = await PackageRepository.findById(id);

    if (!packageItem) {
      throw new ApiError('Package not found', 404);
    }

    return this.format(packageItem);
  }

  static async createPackage(payload) {
    const packageItem = await PackageRepository.create(payload);

    return this.format(packageItem);
  }

  static async updatePackage(id, payload) {
    const existing = await PackageRepository.findById(id);

    if (!existing) {
      throw new ApiError('Package not found', 404);
    }

    const packageItem = await PackageRepository.update(id, payload);

    return this.format(packageItem);
  }

  static async deletePackage(id) {
    const existing = await PackageRepository.findById(id);

    if (!existing) {
      throw new ApiError('Package not found', 404);
    }

    await PackageRepository.delete(id);

    return true;
  }
}

module.exports = PackageService;