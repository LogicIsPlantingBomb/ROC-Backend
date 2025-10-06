const captainModel = require('../models/captain.model');


module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }
    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    })

    return captain;
}

module.exports.getAvailableCaptains = async () => {
    return await captainModel.find({ isAvailable: true });
}

module.exports.updateCaptainLocation = async ({ captain, location }) => {
    if (!captain || !location) {
        throw new Error('Captain and location are required');
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(captain._id, {
        location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
        }
    }, { new: true });

    return updatedCaptain;
}

module.exports.getCaptainById = async (id) => {
    return await captainModel.findById(id);
}

module.exports.getCaptainByEmail = async (email) => {
    return await captainModel.findOne({ email }).select('+password');
}

module.exports.updateCaptainSocketId = async ({ captain, socketId }) => {
    if (!captain || !socketId) {
        throw new Error('Captain and socketId are required');
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(captain._id, {
        socketId
    }, { new: true });

    return updatedCaptain;
}

module.exports.updateCaptainStatus = async ({ captain, status }) => {
    if (!captain || !status) {
        throw new Error('Captain and status are required');
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(captain._id, {
        status
    }, { new: true });

    return updatedCaptain;
}

module.exports.updateCaptainAvailability = async ({ captain, isAvailable }) => {
    if (!captain || typeof isAvailable === 'undefined') {
        throw new Error('Captain and availability status are required');
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(captain._id, {
        isAvailable
    }, { new: true });

    return updatedCaptain;
}

module.exports.getCaptainByRefreshToken = async (refreshToken) => {
    return await captainModel.findOne({ refreshToken }).select('+refreshToken');
}

module.exports.updateCaptainRefreshToken = async ({ captain, refreshToken }) => {
    if (!captain || !refreshToken) {
        throw new Error('Captain and refreshToken are required');
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(captain._id, {
        refreshToken
    }, { new: true });

    return updatedCaptain;
}

module.exports.logoutCaptain = async (captain) => {
    if (!captain) {
        throw new Error('Captain is required');
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(captain._id, {
        refreshToken: null
    }, { new: true });

    return updatedCaptain;
}

module.exports.getCaptainsNearby = async ({ longitude, latitude, radius }) => {
    if (!longitude || !latitude || !radius) {
        throw new Error('Longitude, latitude and radius are required');
    }

    const captains = await captainModel.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: radius
            }
        },
        isAvailable: true
    });

    return captains;
}

module.exports.updateCaptainVehicle = async ({ captain, color, plate, capacity, vehicleType }) => {
    if (!captain || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(captain._id, {
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    }, { new: true });

    return updatedCaptain;
}

module.exports.deleteCaptain = async (captain) => {
    if (!captain) {
        throw new Error('Captain is required');
    }

    const deletedCaptain = await captainModel.findByIdAndDelete(captain._id);

    return deletedCaptain;
}

module.exports.getAllCaptains = async () => {
    return await captainModel.find();
}

module.exports.getCaptainCount = async () => {
    return await captainModel.countDocuments();
}

module.exports.getCaptainCountByStatus = async (status) => {
    return await captainModel.countDocuments({ status });
}

module.exports.getCaptainCountByVehicleType = async (vehicleType) => {
    return await captainModel.countDocuments({ 'vehicle.vehicleType': vehicleType });
}

module.exports.getCaptainCountByDate = async (date) => {
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastWeek = async () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastMonth = async () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastYear = async () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastDay = async () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastHour = async () => {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastMinute = async () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastSecond = async () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 1);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastNHours = async (n) => {
    const date = new Date();
    date.setHours(date.getHours() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastNDays = async (n) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastNWeeks = async (n) => {
    const date = new Date();
    date.setDate(date.getDate() - (n * 7));
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastNMonths = async (n) => {
    const date = new Date();
    date.setMonth(date.getMonth() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastNYears = async (n) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date } });
}

module.exports.getCaptainCountByLastNHoursAndVehicleType = async (n, vehicleType) => {
    const date = new Date();
    date.setHours(date.getHours() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType });
}

module.exports.getCaptainCountByLastNDaysAndVehicleType = async (n, vehicleType) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType });
}

module.exports.getCaptainCountByLastNWeeksAndVehicleType = async (n, vehicleType) => {
    const date = new Date();
    date.setDate(date.getDate() - (n * 7));
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType });
}

module.exports.getCaptainCountByLastNMonthsAndVehicleType = async (n, vehicleType) => {
    const date = new Date();
    date.setMonth(date.getMonth() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType });
}

module.exports.getCaptainCountByLastNYearsAndVehicleType = async (n, vehicleType) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType });
}

module.exports.getCaptainCountByLastNHoursAndStatus = async (n, status) => {
    const date = new Date();
    date.setHours(date.getHours() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, status });
}

module.exports.getCaptainCountByLastNDaysAndStatus = async (n, status) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, status });
}

module.exports.getCaptainCountByLastNWeeksAndStatus = async (n, status) => {
    const date = new Date();
    date.setDate(date.getDate() - (n * 7));
    return await captainModel.countDocuments({ createdAt: { $gte: date }, status });
}

module.exports.getCaptainCountByLastNMonthsAndStatus = async (n, status) => {
    const date = new Date();
    date.setMonth(date.getMonth() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, status });
}

module.exports.getCaptainCountByLastNYearsAndStatus = async (n, status) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, status });
}

module.exports.getCaptainCountByLastNHoursAndVehicleTypeAndStatus = async (n, vehicleType, status) => {
    const date = new Date();
    date.setHours(date.getHours() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType, status });
}

module.exports.getCaptainCountByLastNDaysAndVehicleTypeAndStatus = async (n, vehicleType, status) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType, status });
}

module.exports.getCaptainCountByLastNWeeksAndVehicleTypeAndStatus = async (n, vehicleType, status) => {
    const date = new Date();
    date.setDate(date.getDate() - (n * 7));
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType, status });
}

module.exports.getCaptainCountByLastNMonthsAndVehicleTypeAndStatus = async (n, vehicleType, status) => {
    const date = new Date();
    date.setMonth(date.getMonth() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType, status });
}

module.exports.getCaptainCountByLastNYearsAndVehicleTypeAndStatus = async (n, vehicleType, status) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - n);
    return await captainModel.countDocuments({ createdAt: { $gte: date }, 'vehicle.vehicleType': vehicleType, status });
}
