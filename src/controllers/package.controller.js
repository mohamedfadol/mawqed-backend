const PackageService = require('../services/package.service');
const { validatePackageId } = require('../validations/package.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getActivePackages(req, res) {
  try {
    const packages = await PackageService.getActivePackages();

    return res.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getPackageDetails(req, res) {
  try {
    const id = validatePackageId(req.params.id);

    const packageItem = await PackageService.getPackageDetails(id);

    if (!packageItem.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    return res.json({
      success: true,
      data: {
        package: packageItem,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getActivePackages,
  getPackageDetails,
};