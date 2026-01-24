const rateLimit = require('express-rate-limit');

// Rate limiter for login attempts
// Limits login attempts to prevent brute force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 login requests per windowMs (increased from 5)
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false, // Count failed requests
    // Trust proxy is set in server.js, but we need to explicitly tell rate limiter
    trustProxy: true
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

// Rate limiter for verify code attempts
// Prevents brute force attacks on verification codes
const verifyCodeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 verification attempts per windowMs
    message: {
        success: false,
        message: 'Too many verification attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false // Count failed requests
});

// Rate limiter for resend code attempts
// Prevents abuse of resend code functionality
const resendCodeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 resend requests per windowMs
    message: {
        success: false,
        message: 'Too many resend code attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests (successful and failed)
    skipFailedRequests: false
});

// Rate limiter for forgot password attempts
// Prevents abuse of forgot password functionality
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 forgot password requests per hour
    message: {
        success: false,
        message: 'Too many forgot password attempts from this IP, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests
    skipFailedRequests: false
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

// Rate limiter for reset password attempts
// Prevents abuse of reset password functionality
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 reset password attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many reset password attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false
});

module.exports = {
    loginLimiter,
    registerLimiter,
    verifyCodeLimiter,
    resendCodeLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
    apiLimiter
};

