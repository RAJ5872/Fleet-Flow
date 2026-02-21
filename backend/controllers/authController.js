const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return sendError(res, 400, 'Name, email, and password are required');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 409, 'Email is already registered');
        }

        const user = await User.create({ name, email, password, role });

        sendSuccess(res, 201, 'User registered successfully', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 400, 'Email and password are required');
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return sendError(res, 401, 'Invalid email or password');
        }

        sendSuccess(res, 200, 'Login successful', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    sendSuccess(res, 200, 'Current user fetched', req.user);
};

module.exports = { register, login, getMe };
