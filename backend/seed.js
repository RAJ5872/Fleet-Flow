require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const Maintenance = require('./models/Maintenance');
const Expense = require('./models/Expense');

const seed = async () => {
    await connectDB();
    console.log('🌱 Starting seed with rich Indian fleet data...');

    // Clear everything
    await Promise.all([
        User.deleteMany(), Vehicle.deleteMany(), Driver.deleteMany(),
        Trip.deleteMany(), Maintenance.deleteMany(), Expense.deleteMany(),
    ]);
    console.log('🗑️  Cleared all collections');

    // ── Users ────────────────────────────────────────────────────────────
    const hash = (pw) => bcrypt.hash(pw, 10);
    const users = await User.insertMany([
        { name: 'Rajan Mehta', email: 'manager@fleetflow.com', password: await hash('password123'), role: 'manager' },
        { name: 'Priya Sharma', email: 'dispatcher@fleetflow.com', password: await hash('password123'), role: 'dispatcher' },
        { name: 'Arjun Nair', email: 'safety@fleetflow.com', password: await hash('password123'), role: 'safetyOfficer' },
        { name: 'Sunita Patel', email: 'finance@fleetflow.com', password: await hash('password123'), role: 'finance' },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // ── Vehicles ─────────────────────────────────────────────────────────
    const vehicles = await Vehicle.insertMany([
        { name: 'Bharat Express', model: 'Tata Prima 4028.S', plateNumber: 'MH-14-AB-1234', capacity: 28000, odometer: 87450, status: 'available' },
        { name: 'Delhi Dasher', model: 'Ashok Leyland 3718', plateNumber: 'DL-05-CD-5678', capacity: 18000, odometer: 54200, status: 'available' },
        { name: 'Mumbai Mover', model: 'Mahindra Blazo X 35', plateNumber: 'MH-01-EF-9012', capacity: 35000, odometer: 112300, status: 'onTrip' },
        { name: 'Chennai Carrier', model: 'Volvo FH 400', plateNumber: 'TN-09-GH-3456', capacity: 22000, odometer: 63800, status: 'inService' },
        { name: 'Pune Pacemaker', model: 'BharatBenz 1923', plateNumber: 'MH-12-IJ-7890', capacity: 19000, odometer: 31600, status: 'available' },
        { name: 'Kolkata King', model: 'Eicher Pro 6049', plateNumber: 'WB-02-KL-1111', capacity: 26000, odometer: 78000, status: 'retired' },
    ]);
    console.log(`✅ Created ${vehicles.length} vehicles`);

    // ── Drivers ──────────────────────────────────────────────────────────
    const drivers = await Driver.insertMany([
        { name: 'Ramesh Kumar', contactNumber: '9823456701', licenseNumber: 'MH-2019-012345', licenseExpiryDate: new Date('2026-08-15'), status: 'offDuty', safetyScore: 95 },
        { name: 'Suresh Yadav', contactNumber: '9711234560', licenseNumber: 'DL-2020-067890', licenseExpiryDate: new Date('2025-11-30'), status: 'onDuty', safetyScore: 88 },
        { name: 'Ajay Singh', contactNumber: '9876501234', licenseNumber: 'MH-2018-034567', licenseExpiryDate: new Date('2027-03-20'), status: 'offDuty', safetyScore: 72 },
        { name: 'Vikram Patil', contactNumber: '9944332211', licenseNumber: 'TN-2021-089123', licenseExpiryDate: new Date('2026-06-10'), status: 'offDuty', safetyScore: 91 },
        { name: 'Manish Gupta', contactNumber: '8800112233', licenseNumber: 'WB-2022-045678', licenseExpiryDate: new Date('2023-12-31'), status: 'suspended', safetyScore: 45 },
        { name: 'Deepak Joshi', contactNumber: '9654321098', licenseNumber: 'MH-2023-078901', licenseExpiryDate: new Date('2028-01-25'), status: 'offDuty', safetyScore: 98 },
    ]);
    console.log(`✅ Created ${drivers.length} drivers`);

    // ── Trips ────────────────────────────────────────────────────────────
    const trips = await Trip.insertMany([
        {
            vehicleId: vehicles[2]._id, driverId: drivers[1]._id,
            cargoWeight: 30000, origin: 'Mumbai JNPT Port', destination: 'Delhi ICD Patparganj',
            status: 'dispatched', startOdometer: 112300,
        },
        {
            vehicleId: vehicles[0]._id, driverId: drivers[0]._id,
            cargoWeight: 22000, origin: 'Pune Warehouse', destination: 'Nagpur Depot',
            status: 'completed', startOdometer: 87000, endOdometer: 87450,
        },
        {
            vehicleId: vehicles[1]._id, driverId: drivers[3]._id,
            cargoWeight: 15000, origin: 'Delhi Narela Industrial', destination: 'Jaipur Distribution Hub',
            status: 'completed', startOdometer: 53600, endOdometer: 54200,
        },
        {
            vehicleId: vehicles[4]._id, driverId: drivers[2]._id,
            cargoWeight: 12000, origin: 'Pune Talawade IT Park', destination: 'Aurangabad Plant',
            status: 'draft', startOdometer: 31600,
        },
        {
            vehicleId: vehicles[0]._id, driverId: drivers[5]._id,
            cargoWeight: 18000, origin: 'Mumbai Bhiwandi Hub', destination: 'Hyderabad Katedan',
            status: 'completed', startOdometer: 86400, endOdometer: 87000,
        },
        {
            vehicleId: vehicles[1]._id, driverId: drivers[0]._id,
            cargoWeight: 10000, origin: 'Delhi Okhla', destination: 'Faridabad Sector 25',
            status: 'cancelled', startOdometer: 53200,
        },
    ]);
    console.log(`✅ Created ${trips.length} trips`);

    // ── Maintenance Logs ─────────────────────────────────────────────────
    // Set Chennai Carrier to inService (already done by its status, just log it)
    await Maintenance.insertMany([
        { vehicleId: vehicles[3]._id, description: 'Complete engine overhaul – cylinder head replacement and valve grinding', cost: 45000, date: new Date('2026-02-15') },
        { vehicleId: vehicles[0]._id, description: 'Routine 50,000 km service – oil change, filter replacement, brake inspection', cost: 8500, date: new Date('2026-01-28') },
        { vehicleId: vehicles[2]._id, description: 'Tyre replacement – all 6 rear tyres (Bridgestone R154)', cost: 62000, date: new Date('2026-01-10') },
        { vehicleId: vehicles[1]._id, description: 'Air conditioning system recharge and compressor belt replacement', cost: 6500, date: new Date('2026-02-05') },
        { vehicleId: vehicles[4]._id, description: 'Brake pad replacement – front and rear axle', cost: 12000, date: new Date('2026-02-18') },
        { vehicleId: vehicles[0]._id, description: 'Electrical rewiring – headlights and indicator cluster', cost: 4200, date: new Date('2025-12-20') },
    ]);
    console.log(`✅ Created 6 maintenance logs`);

    // ── Expenses ─────────────────────────────────────────────────────────
    await Expense.insertMany([
        { vehicleId: vehicles[0]._id, fuelLiters: 450, fuelCost: 40950, maintenanceCost: 8500, date: new Date('2026-01-28'), notes: 'Mumbai–Nagpur run refuel at HP Pump, Khopoli' },
        { vehicleId: vehicles[1]._id, fuelLiters: 280, fuelCost: 25480, maintenanceCost: 0, date: new Date('2026-02-02'), notes: 'Delhi–Jaipur run, Indian Oil, NH-48' },
        { vehicleId: vehicles[2]._id, fuelLiters: 620, fuelCost: 56420, maintenanceCost: 62000, date: new Date('2026-01-10'), notes: 'Tyre change + JNPT run refuel' },
        { vehicleId: vehicles[3]._id, fuelLiters: 0, fuelCost: 0, maintenanceCost: 45000, date: new Date('2026-02-15'), notes: 'Engine overhaul – no mileage this month' },
        { vehicleId: vehicles[4]._id, fuelLiters: 180, fuelCost: 16380, maintenanceCost: 12000, date: new Date('2026-02-18'), notes: 'Pune–Aurangabad assigned + brake work' },
        { vehicleId: vehicles[0]._id, fuelLiters: 390, fuelCost: 35490, maintenanceCost: 0, date: new Date('2026-02-10'), notes: 'Bhiwandi–Hyderabad run refuel, BPCL Solapur' },
        { vehicleId: vehicles[1]._id, fuelLiters: 310, fuelCost: 28210, maintenanceCost: 6500, date: new Date('2026-02-05'), notes: 'AC service + Okhla–Faridabad run' },
    ]);
    console.log(`✅ Created 7 expense records`);

    console.log('\n🎉 Seed complete!\n');
    console.log('📋 Login credentials:');
    console.log('   manager@fleetflow.com      / password123  (Manager)');
    console.log('   dispatcher@fleetflow.com   / password123  (Dispatcher)');
    console.log('   safety@fleetflow.com       / password123  (Safety Officer)');
    console.log('   finance@fleetflow.com      / password123  (Finance)');

    await mongoose.disconnect();
    process.exit(0);
};

seed().catch((err) => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
