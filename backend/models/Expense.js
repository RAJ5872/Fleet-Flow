const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'Vehicle is required'],
        },
        fuelLiters: {
            type: Number,
            default: 0,
            min: [0, 'Fuel liters cannot be negative'],
        },
        fuelCost: {
            type: Number,
            default: 0,
            min: [0, 'Fuel cost cannot be negative'],
        },
        maintenanceCost: {
            type: Number,
            default: 0,
            min: [0, 'Maintenance cost cannot be negative'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            default: Date.now,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: total cost for this expense entry
expenseSchema.virtual('totalCost').get(function () {
    return this.fuelCost + this.maintenanceCost;
});

module.exports = mongoose.model('Expense', expenseSchema);
