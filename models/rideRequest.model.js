const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "cancelled"],
        default: "pending",
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Captain",
        default: null,
    },
}, { timestamps: true });

const RideRequest = mongoose.model("RideRequest", rideRequestSchema);

module.exports = RideRequest;
