const PackageService = require('../../services/package.service');

const {
  validatePackageId,
  validatePackageQuery,
  validateCreatePackage,
  validateUpdatePackage,
} = require('../../validations/package.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getPackages(req, res) {
  try {
    const query = validatePackageQuery(req.query);

    const result = await PackageService.getPackages(query);

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getPackageDetails(req, res) {
  try {
    const id = validatePackageId(req.params.id);

    const packageItem = await PackageService.getPackageDetails(id);

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

async function createPackage(req, res) {
  try {
    const payload = validateCreatePackage(req.body);

    const packageItem = await PackageService.createPackage(payload);

    return res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: {
        package: packageItem,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updatePackage(req, res) {
  try {
    const id = validatePackageId(req.params.id);
    const payload = validateUpdatePackage(req.body);

    const packageItem = await PackageService.updatePackage(id, payload);

    return res.json({
      success: true,
      message: 'Package updated successfully',
      data: {
        package: packageItem,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deletePackage(req, res) {
  try {
    const id = validatePackageId(req.params.id);

    await PackageService.deletePackage(id);

    return res.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getPackages,
  getPackageDetails,
  createPackage,
  updatePackage,
  deletePackage,
};