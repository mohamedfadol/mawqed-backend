const express = require('express');

const packageController = require('../controllers/package.controller');

const router = express.Router();

router.get('/', packageController.getActivePackages);
router.get('/:id', packageController.getPackageDetails);

module.exports = router;