const RideRequest = require("../models/rideRequest.model");
const User = require("../models/user.model");

const createRideRequest = async (req, res) => {
    try {
        const { userId, source, destination } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const newRideRequest = new RideRequest({
            user: userId,
            source,
            destination,
        });
        await newRideRequest.save();
        // Emit a "newRideRequest" event to all captains
        req.io.emit("newRideRequest", newRideRequest);
        res.status(201).json(newRideRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getRideRequests = async (req, res) => {
    try {
        const rideRequests = await RideRequest.find({ status: "pending" }).populate("user");
        res.status(200).json(rideRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const acceptRideRequest = async (req, res) => {
    try {
        const { rideRequestId, captainId } = req.body;
        const rideRequest = await RideRequest.findById(rideRequestId);
        if (!rideRequest) {
            return res.status(404).json({ message: "Ride request not found" });
        }
        rideRequest.status = "accepted";
        rideRequest.captain = captainId;
        await rideRequest.save();
        // Emit a "rideRequestAccepted" event to the user
        req.io.emit(`rideRequestAccepted_${rideRequest.user}`, rideRequest);
        res.status(200).json(rideRequest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createRideRequest, getRideRequests, acceptRideRequest };
