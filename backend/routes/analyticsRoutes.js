const express = require('express');
const router = express.Router();
const {
    getFuelEfficiency,
    getCostPerVehicle,
    getTripCompletionRate,
    getOverview,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

// @route   GET /api/analytics/overview
router.get('/overview', protect, getOverview);

// @route   GET /api/analytics/fuel-efficiency/:vehicleId
router.get('/fuel-efficiency/:vehicleId', protect, getFuelEfficiency);

// @route   GET /api/analytics/cost-per-vehicle
router.get('/cost-per-vehicle', authorize('manager', 'finance'), getCostPerVehicle);

// @route   GET /api/analytics/trip-completion-rate
router.get('/trip-completion-rate', protect, getTripCompletionRate);

module.exports = router;
