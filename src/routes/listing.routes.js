const express = require('express');

const listingController = require('../controllers/listing.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { uploadWatchImages } = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/', listingController.getListings);
router.get('/:id', listingController.getListingById); 

// router.post('/', authMiddleware, listingController.createListing);
router.post(
  '/',
  authMiddleware,
  uploadWatchImages.array('images', 10),
  listingController.createListing
);
router.put('/:id', authMiddleware, listingController.updateListing);
router.delete('/:id', authMiddleware, listingController.deleteListing);

router.post(
  '/:id/submit-to-auction',
  authMiddleware,
  listingController.submitToAuction
);

router.post(
  '/:id/images',
  authMiddleware,
  uploadWatchImages.array('images', 10),
  listingController.uploadListingImages
);

module.exports = router;