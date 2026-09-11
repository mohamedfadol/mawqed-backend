const prisma = require('../config/prisma');

function formatBanner(banner) {
  return {
    ...banner,
    id: banner.id.toString(),
  };
}

async function getHomeBanners(req, res) {
  try {
    const banners = await prisma.homeBanner.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return res.json({
      success: true,
      data: banners.map(formatBanner),
    });
  } catch (error) {
    console.error('Get home banners error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

module.exports = {
  getHomeBanners,
};