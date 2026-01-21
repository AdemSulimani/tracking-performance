// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error with details
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        code: err.code
    });

    // Mongoose bad ObjectId (CastError)
    if (err.name === 'CastError') {
        const message = 'Invalid ID format';
        error = { message, status: 400 };
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = { message, status: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        const message = errors.length > 1 ? 'Validation errors' : errors[0];
        error = { 
            message, 
            status: 400,
            errors: errors.length > 1 ? errors : undefined
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, status: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, status: 401 };
    }

    // JWT secret missing
    if (err.message && err.message.includes('JWT_SECRET')) {
        const message = 'Server configuration error';
        error = { message, status: 500 };
    }

    // MongoDB connection errors
    if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
        const message = 'Database connection error';
        error = { message, status: 500 };
    }

    // Send error response
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(error.errors && { errors: error.errors }),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            error: err.message 
        })
    });
};

module.exports = errorHandler;

