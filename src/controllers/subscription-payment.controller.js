const SubscriptionPaymentService = require('../services/subscription-payment.service');

const {
  validateCheckout,
  validatePaymentId,
  validateUserId,
} = require('../validations/subscription-payment.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function createCheckout(req, res) {
  try {
    const payload = validateCheckout(req.body, req.user);

    const result = await SubscriptionPaymentService.createCheckout(payload);

    return res.status(201).json({
      success: true,
      message: 'Checkout created successfully',
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function simulateSuccess(req, res) {
  try {
    const userId = validateUserId(req.user);
    const paymentId = validatePaymentId(req.params.id);

    const result = await SubscriptionPaymentService.simulateSuccess({
      paymentId,
      userId,
    });

    return res.json({
      success: true,
      message: 'Payment completed successfully',
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getPaymentDetails(req, res) {
  try {
    const userId = validateUserId(req.user);
    const paymentId = validatePaymentId(req.params.id);

    const payment = await SubscriptionPaymentService.getPaymentDetails({
      paymentId,
      userId,
    });

    return res.json({
      success: true,
      data: {
        payment,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createCheckout,
  simulateSuccess,
  getPaymentDetails,
};