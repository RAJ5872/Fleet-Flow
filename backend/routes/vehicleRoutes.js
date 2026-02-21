const express = require('express');
const router = express.Router();
const {
    createVehicle,
    getAllVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect); // All vehicle routes require auth

// @route   GET|POST /api/vehicles
router
    .route('/')
    .get(getAllVehicles)
    .post(authorize('manager', 'dispatcher', 'safetyOfficer'), createVehicle);

// @route   GET|PUT|DELETE /api/vehicles/:id
router
    .route('/:id')
    .get(getVehicle)
    .put(authorize('manager', 'dispatcher', 'safetyOfficer'), updateVehicle)
    .delete(authorize('manager', 'dispatcher'), deleteVehicle);

module.exports = router;
