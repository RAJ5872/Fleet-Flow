const Vehicle = require('../models/Vehicle');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private – manager
const createVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        sendSuccess(res, 201, 'Vehicle created successfully', vehicle);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
const getAllVehicles = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
        sendSuccess(res, 200, 'Vehicles fetched', vehicles);
    } catch (err) {
        next(err);
    }
};

// @desc    Get a single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');
        sendSuccess(res, 200, 'Vehicle fetched', vehicle);
    } catch (err) {
        next(err);
    }
};

// @desc    Update vehicle (including status)
// @route   PUT /api/vehicles/:id
// @access  Private – manager
const updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');
        sendSuccess(res, 200, 'Vehicle updated', vehicle);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private – manager
const deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');
        sendSuccess(res, 200, 'Vehicle deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = { createVehicle, getAllVehicles, getVehicle, updateVehicle, deleteVehicle };
