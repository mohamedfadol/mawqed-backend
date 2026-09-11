const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/subscription-payment.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/checkout', controller.createCheckout);
router.post('/:id/simulate-success', controller.simulateSuccess);
router.get('/:id', controller.getPaymentDetails);

module.exports = router;