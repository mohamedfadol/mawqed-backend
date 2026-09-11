const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/bids', accountController.getMyBids);
router.get('/won-auctions', accountController.getWonAuctions);
router.get('/selling', accountController.getSelling);

module.exports = router;