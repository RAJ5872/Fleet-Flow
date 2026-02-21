const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Fuel efficiency per vehicle (km/L)
// @route   GET /api/analytics/fuel-efficiency/:vehicleId
// @access  Private
const getFuelEfficiency = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.vehicleId);
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');

        // Total distance from completed trips
        const trips = await Trip.find({
            vehicleId: vehicle._id,
            status: 'completed',
            startOdometer: { $exists: true },
            endOdometer: { $exists: true },
        });

        const totalDistance = trips.reduce((sum, t) => {
            return sum + (t.endOdometer - t.startOdometer);
        }, 0);

        // Total fuel liters
        const [expenseResult] = await Expense.aggregate([
            { $match: { vehicleId: vehicle._id } },
            { $group: { _id: null, totalFuelLiters: { $sum: '$fuelLiters' } } },
        ]);

        const totalFuelLiters = expenseResult ? expenseResult.totalFuelLiters : 0;
        const fuelEfficiency = totalFuelLiters > 0 ? +(totalDistance / totalFuelLiters).toFixed(2) : null;

        sendSuccess(res, 200, 'Fuel efficiency calculated', {
            vehicle: { _id: vehicle._id, name: vehicle.name, plateNumber: vehicle.plateNumber },
            totalDistance,
            totalFuelLiters,
            fuelEfficiency: fuelEfficiency !== null ? `${fuelEfficiency} km/L` : 'Insufficient data',
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Total cost per vehicle (all vehicles)
// @route   GET /api/analytics/cost-per-vehicle
// @access  Private – finance, manager
const getCostPerVehicle = async (req, res, next) => {
    try {
        const costData = await Expense.aggregate([
            {
                $group: {
                    _id: '$vehicleId',
                    totalFuelCost: { $sum: '$fuelCost' },
                    totalMaintenanceCost: { $sum: '$maintenanceCost' },
                    totalFuelLiters: { $sum: '$fuelLiters' },
                    totalOperationalCost: { $sum: { $add: ['$fuelCost', '$maintenanceCost'] } },
                },
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vehicle',
                },
            },
            { $unwind: '$vehicle' },
            {
                $project: {
                    _id: 0,
                    vehicleId: '$_id',
                    vehicleName: '$vehicle.name',
                    plateNumber: '$vehicle.plateNumber',
                    totalFuelCost: 1,
                    totalMaintenanceCost: 1,
                    totalFuelLiters: 1,
                    totalOperationalCost: 1,
                },
            },
            { $sort: { totalOperationalCost: -1 } },
        ]);

        sendSuccess(res, 200, 'Cost per vehicle fetched', costData);
    } catch (err) {
        next(err);
    }
};

// @desc    Trip completion rate
// @route   GET /api/analytics/trip-completion-rate
// @access  Private
const getTripCompletionRate = async (req, res, next) => {
    try {
        const [result] = await Trip.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    dispatched: { $sum: { $cond: [{ $eq: ['$status', 'dispatched'] }, 1, 0] } },
                    draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                },
            },
        ]);

        if (!result) {
            return sendSuccess(res, 200, 'No trips recorded', { total: 0, completionRate: '0%' });
        }

        const completionRate = ((result.completed / result.total) * 100).toFixed(1);

        sendSuccess(res, 200, 'Trip completion rate calculated', {
            total: result.total,
            completed: result.completed,
            cancelled: result.cancelled,
            dispatched: result.dispatched,
            draft: result.draft,
            completionRate: `${completionRate}%`,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Fleet overview dashboard stats
// @route   GET /api/analytics/overview
// @access  Private
const getOverview = async (req, res, next) => {
    try {
        const [vehicleStats, driverStats, tripStats] = await Promise.all([
            Vehicle.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Trip.countDocuments({ status: { $in: ['dispatched'] } }),
            Trip.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
        ]);

        const vehicleByStatus = vehicleStats.reduce((acc, cur) => {
            acc[cur._id] = cur.count;
            return acc;
        }, {});

        const tripByStatus = tripStats.reduce((acc, cur) => {
            acc[cur._id] = cur.count;
            return acc;
        }, {});

        sendSuccess(res, 200, 'Fleet overview fetched', {
            vehicles: vehicleByStatus,
            activeTrips: driverStats,
            trips: tripByStatus,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getFuelEfficiency, getCostPerVehicle, getTripCompletionRate, getOverview };
