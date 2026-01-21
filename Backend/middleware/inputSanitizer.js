const validator = require('validator');

// Input sanitization middleware
// Sanitizes and validates user inputs to prevent XSS and injection attacks

const sanitizeInput = (req, res, next) => {
    // Fields that should NOT be escaped (like passwords)
    const skipEscaping = ['password', 'confirmPassword'];
    
    // Sanitize string inputs
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                if (skipEscaping.includes(key)) {
                    // For passwords, only trim (don't escape)
                    req.body[key] = req.body[key].trim();
                } else {
                    // For other fields, escape HTML and trim
                    req.body[key] = validator.escape(req.body[key].trim());
                }
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = validator.escape(req.query[key].trim());
            }
        });
    }

    next();
};

// Email validation helper
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return false;
    }
    return validator.isEmail(email.toLowerCase().trim());
};

// Password strength validation
const validatePasswordStrength = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }

    if (password.length > 100) {
        return { valid: false, message: 'Password cannot exceed 100 characters' };
    }

    // Optional: Add more password strength requirements
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumbers = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return { valid: true };
};

// Name validation (alphanumeric with spaces, hyphens, apostrophes)
const validateName = (name) => {
    if (!name || typeof name !== 'string') {
        return { valid: false, message: 'Name is required' };
    }

    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
        return { valid: false, message: 'Name must be at least 2 characters' };
    }

    if (trimmed.length > 50) {
        return { valid: false, message: 'Name cannot exceed 50 characters' };
    }

    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { valid: true, sanitized: trimmed };
};

module.exports = {
    sanitizeInput,
    validateEmail,
    validatePasswordStrength,
    validateName
};

