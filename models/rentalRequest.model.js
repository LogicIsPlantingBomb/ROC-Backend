
const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    duration: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }
}, { timestamps: true });

rentalRequestSchema.index({ location: '2dsphere' });

const rentalRequestModel = mongoose.model('rentalRequest', rentalRequestSchema);

module.exports = rentalRequestModel;
