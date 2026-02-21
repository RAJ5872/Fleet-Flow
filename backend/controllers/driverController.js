const Driver = require('../models/Driver');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Create a driver
// @route   POST /api/drivers
// @access  Private – manager
const createDriver = async (req, res, next) => {
    try {
        const driver = await Driver.create(req.body);
        sendSuccess(res, 201, 'Driver created successfully', driver);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
const getAllDrivers = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const drivers = await Driver.find(filter).sort({ createdAt: -1 });
        sendSuccess(res, 200, 'Drivers fetched', drivers);
    } catch (err) {
        next(err);
    }
};

// @desc    Get a single driver
// @route   GET /api/drivers/:id
// @access  Private
const getDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return sendError(res, 404, 'Driver not found');
        sendSuccess(res, 200, 'Driver fetched', driver);
    } catch (err) {
        next(err);
    }
};

// @desc    Update driver status or info
// @route   PUT /api/drivers/:id
// @access  Private – manager, safetyOfficer
const updateDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!driver) return sendError(res, 404, 'Driver not found');
        sendSuccess(res, 200, 'Driver updated', driver);
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a driver
// @route   DELETE /api/drivers/:id
// @access  Private – manager
const deleteDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return sendError(res, 404, 'Driver not found');
        sendSuccess(res, 200, 'Driver deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = { createDriver, getAllDrivers, getDriver, updateDriver, deleteDriver };
