const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user.model');
const CaptainModel = require('../models/captain.model');


module.exports.getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { address } = req.query;

    try {
        const coordinates = await mapService.getAddressCoordinate(address);
        res.status(200).json(coordinates);
    } catch (error) {
        res.status(404).json({ message: 'Coordinates not found' });
    }
}

module.exports.getDistanceTime = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { origin, destination } = req.query;

        // Assuming origin and destination are passed as "lat,lng" strings
        const [originLtd, originLng] = origin.split(',').map(Number);
        const [destinationLtd, destinationLng] = destination.split(',').map(Number);

        const distanceTime = await mapService.getDistanceTime(
            { ltd: originLtd, lng: originLng },
            { ltd: destinationLtd, lng: destinationLng }
        );

        res.status(200).json(distanceTime);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.getAutoCompleteSuggestions = async (req, res, next) => {

    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { input } = req.query;

        const suggestions = await mapService.getAutoCompleteSuggestions(input);

        res.status(200).json(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.mockLocation = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { type, id, lat, lng } = req.body;

    try {
        let model;
        if (type === 'user') {
            model = UserModel;
        } else {
            model = CaptainModel;
        }

        const result = await model.findByIdAndUpdate(id, {
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            }
        });

        if (!result) {
            return res.status(404).json({ message: `${type} not found` });
        }

        res.status(200).json({ message: `${type} location updated` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}