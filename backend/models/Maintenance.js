const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
    {
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'Vehicle is required'],
        },
        description: {
            type: String,
            required: [true, 'Maintenance description is required'],
            trim: true,
        },
        cost: {
            type: Number,
            required: [true, 'Maintenance cost is required'],
            min: [0, 'Cost cannot be negative'],
        },
        date: {
            type: Date,
            required: [true, 'Maintenance date is required'],
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
