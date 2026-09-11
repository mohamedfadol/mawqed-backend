const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const deviceTokenController = require('../controllers/device-token.controller');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  deviceTokenController.saveDeviceToken
);

module.exports = router;