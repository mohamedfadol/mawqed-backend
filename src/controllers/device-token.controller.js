 const prisma = require('../config/prisma');

async function saveDeviceToken(req, res) {
  try {
    const { token, platform } = req.body;

    if (!token) {
      return res.status(422).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await prisma.deviceToken.upsert({
      where: {
        token,
      },
      update: {
        userId: BigInt(req.user.id),
        platform,
        isActive: true,
      },  
      create: {
        userId: BigInt(req.user.id),
        token,
        platform,
      },
    });

    return res.json({
      success: true,
      message: 'Device token saved successfully',
    });
  } catch (error) {
    console.error('Save device token error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

module.exports = {
  saveDeviceToken,
};