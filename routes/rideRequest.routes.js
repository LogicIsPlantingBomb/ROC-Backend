const express = require("express");
const router = express.Router();
const { createRideRequest, getRideRequests, acceptRideRequest } = require("../controllers/rideRequest.controller");

router.post("/request", createRideRequest);
router.get("/requests", getRideRequests);
router.post("/accept", acceptRideRequest);

module.exports = router;
