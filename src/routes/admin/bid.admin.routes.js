const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');
const controller = require('../../controllers/admin/bid.admin.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);



router.get('/bids', controller.getBids);
router.get('/bids/:id', controller.getBidDetails);
router.post('/bids', controller.createBid);
router.delete('/bids/:id', controller.deleteBid);

module.exports = router;




