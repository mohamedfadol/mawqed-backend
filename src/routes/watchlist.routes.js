const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const watchlistController = require('../controllers/watchlist.controller');

const router = express.Router();

router.get('/watchlist', authMiddleware, watchlistController.getMyWatchlist);
router.post('/:id/watchlist', authMiddleware, watchlistController.addToWatchlist);
router.delete('/:id/watchlist', authMiddleware, watchlistController.removeFromWatchlist);

module.exports = router;