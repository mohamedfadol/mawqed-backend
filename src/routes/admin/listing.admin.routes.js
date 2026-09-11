const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');
const controller = require('../../controllers/admin/listing.admin.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/listings', controller.getListings);
router.get('/listings/:id', controller.getListingDetails);
router.patch('/listings/:id/status', controller.updateListingStatus);
router.delete('/listings/:id', controller.deleteListing);

module.exports = router;