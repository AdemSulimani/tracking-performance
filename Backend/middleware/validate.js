const validator = require('validator');

// Validation middleware for registration
const validateRegister = (req, res, next) => {
    const { companyType, name, lastname, email, password, confirmPassword } = req.body;
    const errors = [];

    // Company type validation
    if (!companyType) {
        errors.push('Company type is required');
    } else if (!['sales', 'real-estate', 'telemarketing', 'agency'].includes(companyType)) {
        errors.push('Invalid company type');
    }

    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    // Lastname validation
    if (!lastname || lastname.trim().length < 2) {
        errors.push('Lastname must be at least 2 characters');
    }

    // Email validation
    if (!email) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    // Confirm password validation
    if (!confirmPassword) {
        errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors 
        });
    }

    next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Email validation
    if (!email) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors 
        });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin
};

