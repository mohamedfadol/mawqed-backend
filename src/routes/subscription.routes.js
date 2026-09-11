const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const subscriptionController = require('../controllers/subscription.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', subscriptionController.subscribeToPackage);
router.get('/', subscriptionController.getMySubscriptions);
router.get('/active', subscriptionController.getMyActiveSubscription);
router.patch('/:id/cancel', subscriptionController.cancelMySubscription);

module.exports = router;