const ApiError = require('../utils/api-error');
const { toBigInt } = require('../utils/serializer');

function validateUserId(user) {
  const userId = toBigInt(user?.id);

  if (!userId) {
    throw new ApiError('Unauthorized user', 401);
  }

  return userId;
}

module.exports = {
  validateUserId,
};