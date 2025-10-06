const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.ORS_API_KEY;
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}`;

    try {
        const response = await axios.get(url);
        if (response.data.features && response.data.features.length > 0) {
            const location = response.data.features[0].geometry.coordinates;
            return {
                ltd: location[1],
                lng: location[0]
            };
        } else {
            throw new Error('Unable to fetch coordinates from ORS');
        }
    } catch (error) {
        console.error('Error fetching coordinates from ORS:', error);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.ORS_API_KEY;
    console.log('Origin coordinates:', origin);
    console.log('Destination coordinates:', destination);
    // Assuming origin and destination are objects with ltd and lng properties
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.lng},${origin.ltd}&end=${destination.lng},${destination.ltd}`;

    try {
        const response = await axios.get(url);
        if (response.data.features && response.data.features.length > 0 && response.data.features[0].properties.segments && response.data.features[0].properties.segments.length > 0) {
            const route = response.data.features[0].properties.segments[0];
            return {
                distance: route.distance,
                duration: route.duration
            };
        } else {
            throw new Error('No routes found from ORS');
        }
    } catch (err) {
        console.error('Error fetching distance and time from ORS:', err);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const apiKey = process.env.ORS_API_KEY;
    const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(input)}`;

    try {
        const response = await axios.get(url);
        if (response.data.features && response.data.features.length > 0) {
            return response.data.features.map(feature => feature.properties.label).filter(value => value);
        } else {
            return [];
        }
    } catch (err) {
        console.error('Error fetching autocomplete suggestions from ORS:', err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {

    // radius in km


    const captains = await captainModel.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, ltd]
                },
                $maxDistance: radius * 1000
            }
        }
    });

    return captains;


}

module.exports.getRoute = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.ORS_API_KEY;
    // Assuming origin and destination are objects with ltd and lng properties
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.lng},${origin.ltd}&end=${destination.lng},${destination.ltd}`;

    try {
        const response = await axios.get(url);
        if (response.data.features && response.data.features.length > 0) {
            const route = response.data.features[0];
            // The geometry is in [longitude, latitude] format, so we need to swap it for Leaflet
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            return coordinates;
        } else {
            throw new Error('No routes found from ORS');
        }
    } catch (err) {
        console.error('Error fetching route from ORS:', err);
        throw err;
    }
}