const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
    {
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'Vehicle is required'],
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: [true, 'Driver is required'],
        },
        cargoWeight: {
            type: Number,
            required: [true, 'Cargo weight is required'],
            min: [0, 'Cargo weight cannot be negative'],
        },
        origin: {
            type: String,
            required: [true, 'Origin is required'],
            trim: true,
        },
        destination: {
            type: String,
            required: [true, 'Destination is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['draft', 'dispatched', 'completed', 'cancelled'],
            default: 'draft',
        },
        startOdometer: {
            type: Number,
            min: [0, 'Start odometer cannot be negative'],
        },
        endOdometer: {
            type: Number,
            min: [0, 'End odometer cannot be negative'],
        },
    },
    { timestamps: true }
);

// Virtual: distance covered
tripSchema.virtual('distanceCovered').get(function () {
    if (this.startOdometer != null && this.endOdometer != null) {
        return this.endOdometer - this.startOdometer;
    }
    return null;
});

module.exports = mongoose.model('Trip', tripSchema);
