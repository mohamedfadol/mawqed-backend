const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');
const controller = require('../../controllers/admin/auction.admin.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);



router.get('/auctions', controller.getAuctions);
router.get('/auctions/:id', controller.getAuctionDetails);
router.post('/auctions', controller.createAuction);
router.patch('/auctions/:id/status', controller.updateAuctionStatus);
router.patch('/auctions/:id/cancel', controller.cancelAuction);
router.delete('/auctions/:id', controller.deleteAuction);

module.exports = router;


