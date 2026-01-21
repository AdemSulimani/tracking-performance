const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ 
                success: false,
                message: 'Server configuration error' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token. User not found.' 
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired' 
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during authentication' 
        });
    }
};

module.exports = { authenticate };

