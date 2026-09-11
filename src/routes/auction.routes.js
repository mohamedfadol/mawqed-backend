const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const bidController = require('../controllers/bid.controller');
const auctionController = require('../controllers/auction.controller');

const router = express.Router();

router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

router.get('/:id/bids', bidController.getAuctionBids);
router.post('/:id/bids', authMiddleware, bidController.createBid);

module.exports = router;