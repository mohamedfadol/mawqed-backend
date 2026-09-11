const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');
const packageController = require('../../controllers/admin/package.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageDetails);
router.post('/', packageController.createPackage);
router.patch('/:id', packageController.updatePackage);
router.delete('/:id', packageController.deletePackage);

module.exports = router;