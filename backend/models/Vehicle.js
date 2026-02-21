const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vehicle name is required'],
            trim: true,
        },
        model: {
            type: String,
            required: [true, 'Vehicle model is required'],
            trim: true,
        },
        plateNumber: {
            type: String,
            required: [true, 'Plate number is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        capacity: {
            type: Number,
            required: [true, 'Cargo capacity is required'],
            min: [0, 'Capacity cannot be negative'],
        },
        odometer: {
            type: Number,
            default: 0,
            min: [0, 'Odometer cannot be negative'],
        },
        status: {
            type: String,
            enum: ['available', 'onTrip', 'inService', 'retired'],
            default: 'available',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
