const express = require('express');
const router = express.Router();
const {
    createMaintenance,
    getMaintenanceLogs,
    getMaintenanceByVehicle,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

// @route   GET|POST /api/maintenance
router
    .route('/')
    .get(getMaintenanceLogs)
    .post(authorize('manager', 'dispatcher'), createMaintenance);

// @route   GET /api/maintenance/vehicle/:vehicleId
router.get('/vehicle/:vehicleId', authorize('manager', 'dispatcher'), getMaintenanceByVehicle);

module.exports = router;
