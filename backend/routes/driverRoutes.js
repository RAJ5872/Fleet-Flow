const express = require('express');
const router = express.Router();
const {
    createDriver,
    getAllDrivers,
    getDriver,
    updateDriver,
    deleteDriver,
} = require('../controllers/driverController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

// @route   GET|POST /api/drivers
router
    .route('/')
    .get(getAllDrivers)
    .post(authorize('manager', 'dispatcher', 'safetyOfficer'), createDriver);

// @route   GET|PUT|DELETE /api/drivers/:id
router
    .route('/:id')
    .get(getDriver)
    .put(authorize('manager', 'dispatcher', 'safetyOfficer'), updateDriver)
    .delete(authorize('manager', 'dispatcher'), deleteDriver);

module.exports = router;
