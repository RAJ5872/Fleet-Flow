const express = require('express');
const router = express.Router();
const {
    addExpense,
    getExpenses,
    getCostByVehicle,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

// @route   GET|POST /api/expenses
router
    .route('/')
    .get(authorize('manager', 'finance'), getExpenses)
    .post(authorize('manager', 'finance'), addExpense);

// @route   GET /api/expenses/vehicle/:vehicleId/cost
router.get('/vehicle/:vehicleId/cost', authorize('manager', 'finance'), getCostByVehicle);

module.exports = router;
