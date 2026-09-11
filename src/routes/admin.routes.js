const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const brandController = require('../controllers/brand.controller');
const adminAuctionController = require('../controllers/admin.auction.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/brands', brandController.createBrand);
router.put('/brands/:id', brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);

router.post('/listings/:id/approve', adminAuctionController.approveListing);
router.post('/listings/:id/reject', adminAuctionController.rejectListing);

router.post('/auctions', adminAuctionController.createAuction);
router.put('/auctions/:id/status', adminAuctionController.updateAuctionStatus);

module.exports = router;