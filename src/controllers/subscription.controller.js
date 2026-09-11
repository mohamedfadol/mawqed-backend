const SubscriptionService = require('../services/subscription.service');

const {
  validateUserId,
  validateSubscriptionId,
  validateSubscribeToPackage,
} = require('../validations/subscription.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function subscribeToPackage(req, res) {
  try {
    const payload = validateSubscribeToPackage(req.body, req.user);

    const subscription =
      await SubscriptionService.subscribeToPackage(payload);

    return res.status(201).json({
      success: true,
      message: 'Subscription created. Payment is pending.',
      data: {
        subscription,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMySubscriptions(req, res) {
  try {
    const userId = validateUserId(req.user);

    const subscriptions =
      await SubscriptionService.getMySubscriptions(userId);

    return res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getMyActiveSubscription(req, res) {
  try {
    const userId = validateUserId(req.user);

    const subscription =
      await SubscriptionService.getMyActiveSubscription(userId);

    return res.json({
      success: true,
      data: {
        subscription,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function cancelMySubscription(req, res) {
  try {
    const userId = validateUserId(req.user);
    const id = validateSubscriptionId(req.params.id);

    const subscription =
      await SubscriptionService.cancelMySubscription({
        id,
        userId,
      });

    return res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        subscription,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  subscribeToPackage,
  getMySubscriptions,
  getMyActiveSubscription,
  cancelMySubscription,
};