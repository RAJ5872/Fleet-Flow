const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Driver name is required'],
            trim: true,
        },
        contactNumber: {
            type: String,
            required: [true, 'Contact number is required'],
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
        },
        licenseNumber: {
            type: String,
            required: [true, 'License number is required'],
            unique: true,
            trim: true,
        },
        licenseExpiryDate: {
            type: Date,
            required: [true, 'License expiry date is required'],
        },
        status: {
            type: String,
            enum: ['onDuty', 'offDuty', 'suspended'],
            default: 'offDuty',
        },
        safetyScore: {
            type: Number,
            default: 100,
            min: [0, 'Safety score cannot be negative'],
            max: [100, 'Safety score cannot exceed 100'],
        },
    },
    { timestamps: true }
);

// Virtual: check if license is currently valid
driverSchema.virtual('isLicenseValid').get(function () {
    return this.licenseExpiryDate > new Date();
});

module.exports = mongoose.model('Driver', driverSchema);
