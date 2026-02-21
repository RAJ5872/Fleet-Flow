/**
 * Sends a consistent success response.
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {*} data - Response payload
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
};

/**
 * Sends a consistent error response.
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error') => {
    return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
