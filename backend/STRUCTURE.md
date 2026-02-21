backend/
├── config/
│   └── db.js                  ← MongoDB connection
├── controllers/
│   ├── authController.js      ← register, login, getMe
│   ├── vehicleController.js   ← CRUD
│   ├── driverController.js    ← CRUD
│   ├── tripController.js      ← create, dispatch, complete, cancel, list
│   ├── maintenanceController.js
│   ├── expenseController.js
│   └── analyticsController.js ← fuel efficiency, cost, completion rate
├── middleware/
│   ├── auth.js                ← JWT protect
│   ├── roleCheck.js           ← authorize(...roles)
│   └── errorHandler.js        ← Global error handler
├── models/
│   ├── User.js
│   ├── Vehicle.js
│   ├── Driver.js
│   ├── Trip.js
│   ├── Maintenance.js
│   └── Expense.js
├── routes/
│   ├── authRoutes.js
│   ├── vehicleRoutes.js
│   ├── driverRoutes.js
│   ├── tripRoutes.js
│   ├── maintenanceRoutes.js
│   ├── expenseRoutes.js
│   └── analyticsRoutes.js
├── utils/
│   └── responseHandler.js     ← sendSuccess / sendError helpers
├── .env
├── .env.example
├── app.js                     ← Express app setup
├── server.js                  ← Entry point
└── seed.js                    ← Seed script
