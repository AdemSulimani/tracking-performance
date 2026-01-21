const rateLimit = require('express-rate-limit');

// Rate limiter for login attempts
// Limits login attempts to prevent brute force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false // Count failed requests
});

// Rate limiter for registration
// Prevents spam registrations
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 registration requests per hour (increased for testing)
    message: {
        success: false,
        message: 'Too many registration attempts from this IP, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limiter
// Protects all API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    registerLimiter,
    apiLimiter
};

