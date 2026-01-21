const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Generate JWT Token
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    
    if (!userId) {
        throw new Error('User ID is required to generate token');
    }

    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Register Controller
const register = async (req, res) => {
    try {
        // 1. Merr të dhënat nga frontend
        const { companyType, name, lastname, email, password, confirmPassword } = req.body;

        // 2. Validimi i të dhënave
        // Kontrollo nëse të gjitha fushat janë plotësuar
        if (!companyType || !name || !lastname || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required' 
            });
        }

        // Validim i email-it
        if (!validator.isEmail(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is not valid' 
            });
        }

        // Validim i gjatësisë së password-it (minimum 6 karaktere)
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters' 
            });
        }

        // Kontrollo nëse password dhe confirmPassword përputhen
        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Passwords do not match' 
            });
        }

        // Validim i name (username)
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            return res.status(400).json({ 
                success: false,
                message: 'Name must be at least 2 characters' 
            });
        }

        // 3. Kontrollo nëse ekziston email-i në databazë
        const existingUserByEmail = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUserByEmail) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is already in use' 
            });
        }

        // 4. Kontrollo nëse ekziston username-i (name) në databazë
        const existingUserByName = await User.findOne({ 
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } // Case-insensitive search
        });
        if (existingUserByName) {
            return res.status(400).json({ 
                success: false,
                message: 'Username (name) is already in use' 
            });
        }

        // 5. Hash password-in me bcrypt (bëhet automatikisht në model pre-save hook)
        // 6. Ruaj user-in në databazë
        const user = await User.create({
            companyType,
            name: trimmedName,
            lastname: lastname.trim(),
            email: email.toLowerCase().trim(),
            password // Do të hash-ohët automatikisht nga pre-save hook
        });

        // 7. Gjenero JWT token
        const token = generateToken(user._id);

        // 8. Kthe përgjigje suksesi
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                companyType: user.companyType,
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false,
                message: 'Validation error',
                errors 
            });
        }

        // Handle duplicate key error (if name becomes unique in future)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            if (field === 'email') {
                return res.status(400).json({ 
                    success: false,
                    message: 'Email is already in use' 
                });
            }
            if (field === 'name') {
                return res.status(400).json({ 
                    success: false,
                    message: 'Username (name) is already in use' 
                });
            }
        }

        // Generic server error
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        // 1. Merr të dhënat (name/email dhe password)
        // Pranon edhe 'email', 'name', ose 'identifier' si fushë
        const { email, name, identifier, password } = req.body;
        
        // Përdor identifier, email, ose name (në këtë renditje)
        const loginIdentifier = identifier || email || name;

        // Validation
        if (!loginIdentifier || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email/name and password are required' 
            });
        }

        // 2. Gjej user-in në databazë me name ose email
        let user;
        const trimmedIdentifier = loginIdentifier.trim();
        
        // Kontrollo nëse identifier-i është email
        if (validator.isEmail(trimmedIdentifier)) {
            // Nëse është email, kërko me email
            user = await User.findOne({ email: trimmedIdentifier.toLowerCase() }).select('+password');
        } else {
            // Nëse nuk është email, kërko me name (case-insensitive)
            user = await User.findOne({ 
                name: { $regex: new RegExp(`^${trimmedIdentifier}$`, 'i') } 
            }).select('+password');
        }

        // 3. Nëse nuk gjendet, kthej "Invalid credentials"
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // 4. Nëse gjendet, krahaso password-in e hash-uar me atë të dërguar (me bcrypt.compare)
        const isPasswordValid = await user.comparePassword(password);
        
        // 5. Nëse nuk përputhen, kthej "Invalid credentials"
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // 6. Nëse përputhen, kthej sukses (dhe JWT token)
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                companyType: user.companyType,
                name: user.name,
                lastname: user.lastname,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Check Email Controller
const checkEmail = async (req, res) => {
    try {
        // Decode email from URL parameter (handles special characters like @)
        let email;
        try {
            email = decodeURIComponent(req.params.email);
        } catch (decodeError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format in URL',
                available: false
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
                available: false
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                available: false
            });
        }

        // Check if email exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: 'Email is already in use',
                available: false
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Email is available',
            available: true
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email check',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Check Username Controller
const checkUsername = async (req, res) => {
    try {
        // Decode username from URL parameter
        let username;
        try {
            username = decodeURIComponent(req.params.username);
        } catch (decodeError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username format in URL',
                available: false
            });
        }

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required',
                available: false
            });
        }

        const trimmedUsername = username.trim();

        // Validate username length
        if (trimmedUsername.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Username must be at least 2 characters',
                available: false
            });
        }

        // Check if username (name) exists (case-insensitive)
        const existingUser = await User.findOne({
            name: { $regex: new RegExp(`^${trimmedUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: 'Username is already in use',
                available: false
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Username is available',
            available: true
        });

    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during username check',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    register,
    login,
    checkEmail,
    checkUsername
};

