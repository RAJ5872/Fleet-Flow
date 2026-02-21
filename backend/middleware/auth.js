const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return sendError(res, 401, 'Not authorized – no token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return sendError(res, 401, 'Not authorized – user not found');
        }
        next();
    } catch (err) {
        return sendError(res, 401, 'Not authorized – token invalid or expired');
    }
};

module.exports = { protect };
