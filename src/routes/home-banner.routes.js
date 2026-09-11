const express = require('express');

const controller = require('../controllers/home-banner.controller');

const router = express.Router();

router.get('/', controller.getHomeBanners);

module.exports = router;