const SubscriptionService = require('../../services/subscription.service');

const {
  validateSubscriptionId,
  validateAdminSubscriptionQuery,
  validateCreateSubscription,
  validateUpdateSubscriptionStatus,
} = require('../../validations/subscription.validation');

function handleError(res, error) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.statusCode ? error.message : 'Server error',
  });
}

async function getSubscriptions(req, res) {
  try {
    const query = validateAdminSubscriptionQuery(req.query);

    const result = await SubscriptionService.getSubscriptions(query);

    return res.json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getSubscriptionDetails(req, res) {
  try {
    const id = validateSubscriptionId(req.params.id);

    const subscription =
      await SubscriptionService.getSubscriptionDetails(id);

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

async function createSubscription(req, res) {
  try {
    const payload = validateCreateSubscription(req.body);

    const subscription =
      await SubscriptionService.createSubscriptionByAdmin(payload);

    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateSubscriptionStatus(req, res) {
  try {
    const id = validateSubscriptionId(req.params.id);
    const payload = validateUpdateSubscriptionStatus(req.body);

    const subscription =
      await SubscriptionService.updateSubscriptionStatus(id, payload);

    return res.json({
      success: true,
      message: 'Subscription status updated successfully',
      data: {
        subscription,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getSubscriptions,
  getSubscriptionDetails,
  createSubscription,
  updateSubscriptionStatus,
};