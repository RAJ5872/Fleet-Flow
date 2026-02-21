const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Add an expense record
// @route   POST /api/expenses
// @access  Private – finance, manager
const addExpense = async (req, res, next) => {
    try {
        const { vehicleId } = req.body;
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');

        const expense = await Expense.create(req.body);
        const populated = await Expense.findById(expense._id).populate(
            'vehicleId',
            'name plateNumber'
        );

        sendSuccess(res, 201, 'Expense recorded', populated);
    } catch (err) {
        next(err);
    }
};

// @desc    Get expenses (optionally by vehicle)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
    try {
        const { vehicleId } = req.query;
        const filter = vehicleId ? { vehicleId } : {};

        const expenses = await Expense.find(filter)
            .populate('vehicleId', 'name plateNumber')
            .sort({ date: -1 });

        // Compute totals for the result set
        const totalFuelCost = expenses.reduce((sum, e) => sum + e.fuelCost, 0);
        const totalMaintenanceCost = expenses.reduce((sum, e) => sum + e.maintenanceCost, 0);
        const totalFuelLiters = expenses.reduce((sum, e) => sum + e.fuelLiters, 0);

        sendSuccess(res, 200, 'Expenses fetched', {
            count: expenses.length,
            summary: {
                totalFuelCost,
                totalMaintenanceCost,
                totalOperationalCost: totalFuelCost + totalMaintenanceCost,
                totalFuelLiters,
            },
            expenses,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get total operational cost per vehicle
// @route   GET /api/expenses/vehicle/:vehicleId/cost
// @access  Private
const getCostByVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.vehicleId);
        if (!vehicle) return sendError(res, 404, 'Vehicle not found');

        const [result] = await Expense.aggregate([
            { $match: { vehicleId: vehicle._id } },
            {
                $group: {
                    _id: '$vehicleId',
                    totalFuelCost: { $sum: '$fuelCost' },
                    totalMaintenanceCost: { $sum: '$maintenanceCost' },
                    totalFuelLiters: { $sum: '$fuelLiters' },
                    totalOperationalCost: { $sum: { $add: ['$fuelCost', '$maintenanceCost'] } },
                    count: { $sum: 1 },
                },
            },
        ]);

        sendSuccess(res, 200, 'Cost summary fetched', {
            vehicle: { _id: vehicle._id, name: vehicle.name, plateNumber: vehicle.plateNumber },
            costSummary: result || { totalFuelCost: 0, totalMaintenanceCost: 0, totalOperationalCost: 0, totalFuelLiters: 0, count: 0 },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { addExpense, getExpenses, getCostByVehicle };
