const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blackListToken.model');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');


module.exports.registerCaptain = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isCaptainAlreadyExist = await captainModel.findOne({ email });

    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain already exist' });
    }


    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const accessToken = captain.generateAuthToken();
    const refreshToken = captain.generateRefreshToken();

    captain.refreshToken = refreshToken;
    await captain.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });

    res.status(201).json({ accessToken, captain });

}

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select('+password');

    if (!captain) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await captain.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = captain.generateAuthToken();
    const refreshToken = captain.generateRefreshToken();

    captain.refreshToken = refreshToken;
    await captain.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });
    res.status(200).json({ accessToken, captain });

    // Set captain as available after successful login
    await captainService.updateCaptainAvailability({ captain: captain, isAvailable: true });
}

module.exports.updateCaptainAvailability = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { isAvailable } = req.body;

    try {
        const updatedCaptain = await captainService.updateCaptainAvailability({ captain: req.captain, isAvailable });
        res.status(200).json({ captain: updatedCaptain });
    } catch (error) {
        console.error('Error updating captain availability:', error);
        res.status(500).json({ message: 'Error updating availability' });
    }
}

module.exports.refreshAccessToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
        console.error('JWT_REFRESH_SECRET is not defined in environment variables.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const captain = await captainModel.findById(decoded._id).select('+refreshToken');

        if (!captain || captain.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const accessToken = captain.generateAuthToken();
        res.status(200).json({ accessToken });

    } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
}

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
}

module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    await blackListTokenModel.create({ token });

    // Also invalidate the refresh token
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const captain = await captainModel.findById(decoded._id).select('+refreshToken');
            if (captain) {
                captain.refreshToken = null;
                await captain.save();
            }
        } catch (error) {
            // ignore error if refresh token is invalid
        }
    }


    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logout successfully' });

    // Set captain as unavailable after logout
    if (req.captain) {
        await captainService.updateCaptainAvailability({ captain: req.captain, isAvailable: false });
    }
}