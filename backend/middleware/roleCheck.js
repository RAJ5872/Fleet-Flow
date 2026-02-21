const { sendError } = require('../utils/responseHandler');

/**
 * Restricts access to users whose role is in the allowed list.
 * Usage: authorize('manager', 'dispatcher')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                403,
                `Access denied: role '${req.user.role}' is not authorized for this resource`
            );
        }
        next();
    };
};

module.exports = { authorize };
