const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Log a maintenance event
// @route   POST /api/maintenance
// @access  Private – manager, safetyOfficer
const createMaintenance = async (req, res, next) => {
    try {
        const { vehicleId, description, cost, date } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');

        // Business Rule: creating maintenance puts vehicle inService
        vehicle.status = 'inService';
        await vehicle.save();

        const log = await Maintenance.create({ vehicleId, description, cost, date });
        const populated = await Maintenance.findById(log._id).populate(
            'vehicleId',
            'name plateNumber status'
        );

        sendSuccess(res, 201, 'Maintenance log created – vehicle status set to inService', populated);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all maintenance logs (optionally by vehicle)
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceLogs = async (req, res, next) => {
    try {
        const { vehicleId } = req.query;
        const filter = vehicleId ? { vehicleId } : {};

        const logs = await Maintenance.find(filter)
            .populate('vehicleId', 'name plateNumber status')
            .sort({ date: -1 });

        sendSuccess(res, 200, 'Maintenance logs fetched', logs);
    } catch (err) {
        next(err);
    }
};

// @desc    Get maintenance logs for a specific vehicle
// @route   GET /api/maintenance/vehicle/:vehicleId
// @access  Private
const getMaintenanceByVehicle = async (req, res, next) => {
    try {
        const logs = await Maintenance.find({ vehicleId: req.params.vehicleId })
            .populate('vehicleId', 'name plateNumber status')
            .sort({ date: -1 });

        sendSuccess(res, 200, 'Maintenance logs fetched', logs);
    } catch (err) {
        next(err);
    }
};

module.exports = { createMaintenance, getMaintenanceLogs, getMaintenanceByVehicle };
