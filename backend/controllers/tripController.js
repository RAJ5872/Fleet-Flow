const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Create a trip (draft)
// @route   POST /api/trips
// @access  Private – dispatcher, manager
const createTrip = async (req, res, next) => {
    try {
        const { vehicleId, driverId, cargoWeight, origin, destination, startOdometer } = req.body;

        // Fetch vehicle and driver
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');

        const driver = await Driver.findById(driverId);
        if (!driver) return sendError(res, 404, 'Driver not found');

        // Business Rule 1: cargo weight must not exceed vehicle capacity
        if (cargoWeight > vehicle.capacity) {
            return sendError(
                res,
                400,
                `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg)`
            );
        }

        // Business Rule 2: vehicle must be available
        if (vehicle.status !== 'available') {
            return sendError(
                res,
                400,
                `Vehicle is not available – current status: ${vehicle.status}`
            );
        }

        // Business Rule 3: driver license must not be expired
        if (new Date(driver.licenseExpiryDate) < new Date()) {
            return sendError(res, 400, `Driver's license has expired on ${driver.licenseExpiryDate.toDateString()}`);
        }

        const trip = await Trip.create({
            vehicleId,
            driverId,
            cargoWeight,
            origin,
            destination,
            startOdometer,
            status: 'draft',
        });

        const populated = await Trip.findById(trip._id)
            .populate('vehicleId', 'name plateNumber status')
            .populate('driverId', 'name licenseNumber status');

        sendSuccess(res, 201, 'Trip created (draft)', populated);
    } catch (err) {
        next(err);
    }
};

// @desc    Dispatch a trip (draft → dispatched)
// @route   PUT /api/trips/:id/dispatch
// @access  Private – dispatcher, manager
const dispatchTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return sendError(res, 404, 'Trip not found');
        if (trip.status !== 'draft') {
            return sendError(res, 400, `Trip cannot be dispatched – current status: ${trip.status}`);
        }

        // Set statuses
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'onTrip' });
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'onDuty' });

        trip.status = 'dispatched';
        await trip.save();

        const populated = await Trip.findById(trip._id)
            .populate('vehicleId', 'name plateNumber status')
            .populate('driverId', 'name licenseNumber status');

        sendSuccess(res, 200, 'Trip dispatched – vehicle and driver set to onTrip / onDuty', populated);
    } catch (err) {
        next(err);
    }
};

// @desc    Complete a trip (dispatched → completed)
// @route   PUT /api/trips/:id/complete
// @access  Private – dispatcher, manager
const completeTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return sendError(res, 404, 'Trip not found');
        if (trip.status !== 'dispatched') {
            return sendError(res, 400, `Trip cannot be completed – current status: ${trip.status}`);
        }

        const { endOdometer } = req.body;
        if (endOdometer !== undefined) {
            if (trip.startOdometer !== undefined && endOdometer < trip.startOdometer) {
                return sendError(res, 400, 'End odometer cannot be less than start odometer');
            }
            trip.endOdometer = endOdometer;

            // Update vehicle odometer
            await Vehicle.findByIdAndUpdate(trip.vehicleId, { odometer: endOdometer });
        }

        // Reset statuses
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'offDuty' });

        trip.status = 'completed';
        await trip.save();

        const populated = await Trip.findById(trip._id)
            .populate('vehicleId', 'name plateNumber status odometer')
            .populate('driverId', 'name licenseNumber status');

        sendSuccess(res, 200, 'Trip completed – vehicle and driver set to available / offDuty', populated);
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel a trip (draft | dispatched → cancelled)
// @route   PUT /api/trips/:id/cancel
// @access  Private – manager
const cancelTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return sendError(res, 404, 'Trip not found');
        if (['completed', 'cancelled'].includes(trip.status)) {
            return sendError(res, 400, `Trip cannot be cancelled – current status: ${trip.status}`);
        }

        // If it was dispatched, free up vehicle and driver
        if (trip.status === 'dispatched') {
            await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
            await Driver.findByIdAndUpdate(trip.driverId, { status: 'offDuty' });
        }

        trip.status = 'cancelled';
        await trip.save();

        const populated = await Trip.findById(trip._id)
            .populate('vehicleId', 'name plateNumber status')
            .populate('driverId', 'name licenseNumber status');

        sendSuccess(res, 200, 'Trip cancelled', populated);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
const getAllTrips = async (req, res, next) => {
    try {
        const { status, vehicleId, driverId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (vehicleId) filter.vehicleId = vehicleId;
        if (driverId) filter.driverId = driverId;

        const trips = await Trip.find(filter)
            .populate('vehicleId', 'name plateNumber capacity odometer status')
            .populate('driverId', 'name licenseNumber licenseExpiryDate status safetyScore')
            .sort({ createdAt: -1 });

        sendSuccess(res, 200, 'Trips fetched', trips);
    } catch (err) {
        next(err);
    }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('vehicleId', 'name plateNumber capacity odometer status')
            .populate('driverId', 'name licenseNumber licenseExpiryDate status safetyScore');
        if (!trip) return sendError(res, 404, 'Trip not found');
        sendSuccess(res, 200, 'Trip fetched', trip);
    } catch (err) {
        next(err);
    }
};

module.exports = { createTrip, dispatchTrip, completeTrip, cancelTrip, getAllTrips, getTrip };
