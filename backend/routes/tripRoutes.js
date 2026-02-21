const express = require('express');
const router = express.Router();
const {
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    getAllTrips,
    getTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

// @route   GET|POST /api/trips
router
    .route('/')
    .get(getAllTrips)
    .post(authorize('manager', 'dispatcher'), createTrip);

// @route   GET /api/trips/:id
router.get('/:id', getTrip);

// @route   PUT /api/trips/:id/dispatch
router.put('/:id/dispatch', authorize('manager', 'dispatcher'), dispatchTrip);

// @route   PUT /api/trips/:id/complete
router.put('/:id/complete', authorize('manager', 'dispatcher'), completeTrip);

// @route   PUT /api/trips/:id/cancel
router.put('/:id/cancel', authorize('manager', 'dispatcher'), cancelTrip);

module.exports = router;
