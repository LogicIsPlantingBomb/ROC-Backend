
const rentalRequestModel = require('../models/rentalRequest.model.js');
const userModel = require('../models/user.model.js');

exports.createRentalRequest = async (req, res) => {
    try {
        const { latitude, longitude, duration, price } = req.body;
        const user = req.user;

        const rentalRequest = new rentalRequestModel({
            user: user._id,
            location: {
                coordinates: [longitude, latitude]
            },
            duration,
            price
        });

        await rentalRequest.save();

        // Find nearby users and emit a socket event
        const nearbyUsers = await userModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000 // 5km in meters
                }
            }
        });

        for (const nearbyUser of nearbyUsers) {
            if (nearbyUser.socketId) {
                req.app.get('io').to(nearbyUser.socketId).emit('newRentalRequest', rentalRequest);
            }
        }

        res.status(201).json({ success: true, data: rentalRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRentalRequests = async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        const rentalRequests = await rentalRequestModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 5000 // 5km in meters
                }
            },
            status: 'pending'
        }).populate('user', 'fullname');

        res.status(200).json({ success: true, data: rentalRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
