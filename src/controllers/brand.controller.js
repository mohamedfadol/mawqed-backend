const prisma = require('../config/prisma');

function makeSlug(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function getBrands(req, res) {
  try {
    const brands = await prisma.watchBrand.findMany({
      where: {
        status: true,
      },
      orderBy: {
        nameEn: 'asc',
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
        status: true,
      },
    });

    return res.json({
      success: true,
      data: brands.map((brand) => ({
        ...brand,
        id: brand.id.toString(),
      })),
    });
  } catch (error) {
    console.error('Get brands error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function createBrand(req, res) {
  try {
    const { nameEn, nameAr, slug, status } = req.body;

    if (!nameEn) {
      return res.status(422).json({
        success: false,
        message: 'English brand name is required',
      });
    }

    const finalSlug = slug ? makeSlug(slug) : makeSlug(nameEn);

    const existingBrand = await prisma.watchBrand.findUnique({
      where: {
        slug: finalSlug,
      },
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: 'Brand already exists',
      });
    }

    const brand = await prisma.watchBrand.create({
      data: {
        nameEn,
        nameAr: nameAr || null,
        slug: finalSlug,
        status: typeof status === 'boolean' ? status : true,
      },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: {
        brand: {
          ...brand,
          id: brand.id.toString(),
        },
      },
    });
  } catch (error) {
    console.error('Create brand error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function updateBrand(req, res) {
  try {
    const id = BigInt(req.params.id);
    const { nameEn, nameAr, slug, status } = req.body;

    const brand = await prisma.watchBrand.findUnique({
      where: { id },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    const data = {};

    if (nameEn !== undefined) data.nameEn = nameEn;
    if (nameAr !== undefined) data.nameAr = nameAr;
    if (status !== undefined) data.status = status === true || status === 'true';

    if (slug !== undefined) {
      const finalSlug = makeSlug(slug);

      const existingBrand = await prisma.watchBrand.findFirst({
        where: {
          slug: finalSlug,
          NOT: {
            id,
          },
        },
      });

      if (existingBrand) {
        return res.status(409).json({
          success: false,
          message: 'Brand slug already exists',
        });
      }

      data.slug = finalSlug;
    }

    const updatedBrand = await prisma.watchBrand.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: 'Brand updated successfully',
      data: {
        brand: {
          ...updatedBrand,
          id: updatedBrand.id.toString(),
        },
      },
    });
  } catch (error) {
    console.error('Update brand error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

async function deleteBrand(req, res) {
  try {
    const id = BigInt(req.params.id);

    const brand = await prisma.watchBrand.findUnique({
      where: { id },
      include: {
        listings: true,
      },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    if (brand.listings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete brand because it has listings',
      });
    }

    await prisma.watchBrand.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error('Delete brand error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

module.exports = {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};