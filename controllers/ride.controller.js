const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const captainService = require('../services/captain.service');

const rideModel = require('../models/ride.model');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination);

        const ride = await rideService.createRide({
            user: req.user._id,
            pickup: pickup,
            destination: destination,
            pickupCoordinates: pickupCoordinates,
            destinationCoordinates: destinationCoordinates,
            vehicleType: vehicleType
        });

        const availableCaptains = await captainService.getCaptainsNearby({
            longitude: pickupCoordinates.lng,
            latitude: pickupCoordinates.ltd,
            radius: 50000 // 50km
        });

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        console.log('Available Captains:', availableCaptains.length);

        availableCaptains.map(captain => {
            console.log('Sending new-ride to captain:', captain._id, 'with socketId:', captain.socketId);
            req.io.to(captain.socketId).emit('new-ride', rideWithUser);
        })
        res.status(201).json(ride);

    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }

};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination);

        const fare = await rideService.getFare(pickupCoordinates, destinationCoordinates);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        const route = await mapService.getRoute(ride.pickupCoordinates, ride.destinationCoordinates);

        const rideWithRoute = { ...ride.toObject(), route };

        const rideForCaptain = { ...rideWithRoute };
        delete rideForCaptain.otp;


        req.io.to(ride.user.socketId).emit('ride-confirmed', rideWithRoute);

        req.io.to(ride.captain.socketId).emit('ride-confirmed', rideForCaptain);

        return res.status(200).json(rideForCaptain);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.body;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        req.io.to(ride.user.socketId).emit('ride-started', ride);

        req.io.to(ride.captain.socketId).emit('ride-started', ride);

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })

        sendMessageToSocketId(ride.captain.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.cancelRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.cancelRide({ rideId, user: req.user });

        if (ride.captain) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'ride-cancelled',
                data: ride
            })
        }

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.cancelRideByCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.cancelRideByCaptain({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-cancelled',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
