const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');
const subscriptionController = require('../../controllers/admin/subscription.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', subscriptionController.getSubscriptions);
router.get('/:id', subscriptionController.getSubscriptionDetails);
router.post('/', subscriptionController.createSubscription);
router.patch('/:id/status', subscriptionController.updateSubscriptionStatus);

module.exports = router;