
const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rental.controller.js');
const { authUser } = require('../middlewares/auth.middleware.js');

router.post('/', authUser, rentalController.createRentalRequest);
router.get('/', authUser, rentalController.getRentalRequests);

module.exports = router;
