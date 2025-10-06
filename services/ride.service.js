const rideModel = require('../models/ride.model');
const Captain = require('../models/captain.model');
const mapService = require('./maps.service');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function getFare(pickup, destination) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };



    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance / 1000) * perKmRate.auto) + ((distanceTime.duration / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance / 1000) * perKmRate.car) + ((distanceTime.duration / 60) * perMinuteRate.car)),
        moto: Math.round(baseFare.moto + ((distanceTime.distance / 1000) * perKmRate.moto) + ((distanceTime.duration / 60) * perMinuteRate.moto))
    };

    return fare;


}

module.exports.getFare = getFare;


function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}


module.exports.createRide = async ({
    user, pickup, destination, pickupCoordinates, destinationCoordinates, vehicleType
}) => {
    if (!user || !pickup || !destination || !pickupCoordinates || !destinationCoordinates || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickupCoordinates, destinationCoordinates);



    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        pickupCoordinates,
        destinationCoordinates,
        otp: getOtp(6),
        fare: fare[ vehicleType ],
        vehicleType
    })

    return ride;
}

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    if (!captain.isAvailable) {
        throw new Error('Captain is not available');
    }

    const ride = await rideModel.findOneAndUpdate({
        _id: rideId,
        status: 'pending'
    }, {
        status: 'confirmed',
        captain: captain._id
    }, { new: true }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found or already taken');
    }

    await Captain.findByIdAndUpdate(captain._id, { isAvailable: false });

    return ride;
}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'confirmed') {
        throw new Error('Ride not confirmed');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    ride.status = 'started';
    await ride.save();

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOneAndUpdate({
        _id: rideId,
        captain: captain._id,
        status: 'started'
    }, {
        status: 'completed'
    }, { new: true }).populate('user').populate('captain');

    if (!ride) {
        throw new Error('Ride not found or not started');
    }

    await Captain.findByIdAndUpdate(captain._id, { isAvailable: true });

    return ride;
}

module.exports.cancelRide = async ({ rideId, user }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOneAndUpdate({
        _id: rideId,
        user: user._id,
        status: { $in: ['pending', 'confirmed'] }
    }, {
        status: 'cancelled'
    }, { new: true }).populate('user').populate('captain');

    if (!ride) {
        throw new Error('Ride not found or cannot be cancelled');
    }

    if (ride.captain) {
        await Captain.findByIdAndUpdate(ride.captain._id, { isAvailable: true });
    }

    return ride;
}

module.exports.cancelRideByCaptain = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOneAndUpdate({
        _id: rideId,
        captain: captain._id,
        status: { $in: ['confirmed', 'started'] }
    }, {
        status: 'cancelled'
    }, { new: true }).populate('user').populate('captain');

    if (!ride) {
        throw new Error('Ride not found or cannot be cancelled');
    }

    await Captain.findByIdAndUpdate(ride.captain._id, { isAvailable: true });

    return ride;
}

