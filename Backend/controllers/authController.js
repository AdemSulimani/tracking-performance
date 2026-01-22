const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendVerificationCode, sendPasswordResetEmail } = require('../utils/emailService');

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

        // 6. Nëse përputhen, gjenero kod verifikimi 6-shifror (random)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 7. Vendos kohën e skadimit (15 minuta nga tani)
        const verificationCodeExpires = new Date();
        verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 15);

        // 8. Ruaj kod verifikimi në databazë
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        user.isVerified = false;
        await user.save();

        // 9. Dërgo kod verifikimi në email
        try {
            await sendVerificationCode(user.email, verificationCode);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Nëse dërgimi i email-it dështon, fshi kod verifikimi dhe kthej gabim
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();
            
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification code. Please try again.'
            });
        }

        // 10. Kthej përgjigje me requiresVerification: true (pa token)
        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email',
            requiresVerification: true,
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

// Verify Code Controller
const verifyCode = async (req, res) => {
    try {
        // 1. Merr të dhënat (email/name dhe code) nga request body
        const { email, name, identifier, code } = req.body;

        // Përdor identifier, email, ose name (në këtë renditje)
        const loginIdentifier = identifier || email || name;

        // Validation
        if (!loginIdentifier || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email/name and verification code are required'
            });
        }

        // Validim i kodit (duhet të jetë 6 shifra)
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code must be 6 digits'
            });
        }

        // 2. Gjej user-in në databazë me name ose email (duhet të përfshijë verificationCode)
        let user;
        const trimmedIdentifier = loginIdentifier.trim();

        // Kontrollo nëse identifier-i është email
        if (validator.isEmail(trimmedIdentifier)) {
            // Nëse është email, kërko me email
            user = await User.findOne({ email: trimmedIdentifier.toLowerCase() })
                .select('+verificationCode');
        } else {
            // Nëse nuk është email, kërko me name (case-insensitive)
            user = await User.findOne({
                name: { $regex: new RegExp(`^${trimmedIdentifier}$`, 'i') }
            }).select('+verificationCode');
        }

        // 3. Nëse nuk gjendet user, kthej gabim
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // 4. Kontrollo nëse kodi përputhet me verificationCode
        if (!user.verificationCode || user.verificationCode !== code) {
            return res.status(401).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // 5. Kontrollo nëse kodi nuk ka skaduar (verificationCodeExpires)
        if (!user.verificationCodeExpires || new Date() > user.verificationCodeExpires) {
            // Fshi kod verifikimi të skaduar
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();

            return res.status(401).json({
                success: false,
                message: 'Verification code has expired. Please login again.'
            });
        }

        // 6. Nëse është valid: Fshi verificationCode dhe verificationCodeExpires
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.isVerified = true;
        await user.save();

        // 7. Krijo JWT token
        const token = generateToken(user._id);

        // 8. Kthe token dhe të dhënat e user-it
        res.status(200).json({
            success: true,
            message: 'Verification successful',
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
        console.error('Verify code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during code verification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Resend Code Controller
const resendCode = async (req, res) => {
    try {
        // 1. Merr të dhënat (email/name) nga request body
        const { email, name, identifier } = req.body;

        // Përdor identifier, email, ose name (në këtë renditje)
        const loginIdentifier = identifier || email || name;

        // Validation
        if (!loginIdentifier) {
            return res.status(400).json({
                success: false,
                message: 'Email/name is required'
            });
        }

        // 2. Gjej user-in në databazë me name ose email
        let user;
        const trimmedIdentifier = loginIdentifier.trim();

        // Kontrollo nëse identifier-i është email
        if (validator.isEmail(trimmedIdentifier)) {
            // Nëse është email, kërko me email
            user = await User.findOne({ email: trimmedIdentifier.toLowerCase() });
        } else {
            // Nëse nuk është email, kërko me name (case-insensitive)
            user = await User.findOne({
                name: { $regex: new RegExp(`^${trimmedIdentifier}$`, 'i') }
            });
        }

        // 3. Nëse nuk gjendet user, kthej gabim
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4. Gjenero kod verifikimi të ri 6-shifror
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 5. Vendos kohën e skadimit (15 minuta nga tani)
        const verificationCodeExpires = new Date();
        verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 15);

        // 6. Ruaj kod verifikimi të ri në databazë
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        user.isVerified = false;
        await user.save();

        // 7. Dërgo kod verifikimi të ri në email
        try {
            await sendVerificationCode(user.email, verificationCode);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Nëse dërgimi i email-it dështon, fshi kod verifikimi dhe kthej gabim
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();
            
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification code. Please try again.'
            });
        }

        // 8. Kthej përgjigje suksesi
        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email'
        });

    } catch (error) {
        console.error('Resend code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during resend code',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
    try {
        // 1. Merr email nga request body
        const { email } = req.body;

        // 2. Validim i email-it
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Validim i formatit të email-it
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // 3. Gjej user-in në databazë me email
        const user = await User.findOne({ email: email.toLowerCase().trim() })
            .select('+resetPasswordToken'); // Include resetPasswordToken field

        // 4. Nëse user nuk ekziston, kthej mesazh të përgjithshëm (për siguri)
        // Nuk duhet të tregojmë nëse email-i ekziston apo jo
        if (!user) {
            // Kthej mesazh suksesi edhe nëse user nuk ekziston (security best practice)
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, password reset instructions have been sent'
            });
        }

        // 5. Gjenero token unik 64 karaktere hex
        const resetToken = crypto.randomBytes(32).toString('hex');

        // 6. Hash-on token-in me bcrypt para se ta ruajmë në databazë
        const salt = await bcrypt.genSalt(10);
        const hashedToken = await bcrypt.hash(resetToken, salt);

        // 7. Vendos kohën e skadimit (1 orë nga tani)
        const resetPasswordExpires = new Date();
        resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

        // 8. Ruaj token-in e hash-uar dhe expiry time në databazë
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        // 9. Merr frontend URL nga environment variables (ose përdor default)
        const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

        // 10. Dërgo email me link për reset password
        try {
            await sendPasswordResetEmail(user.email, resetToken, frontendUrl);
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Nëse dërgimi i email-it dështon, fshi token dhe expiry time
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email. Please try again.'
            });
        }

        // 11. Kthej përgjigje suksesi
        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, password reset instructions have been sent'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during forgot password request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
    try {
        // 1. Merr të dhënat nga request body
        const { token, password, confirmPassword } = req.body;

        // 2. Validim i të dhënave
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token, password, and confirm password are required'
            });
        }

        // Validim i gjatësisë së password-it
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

        // 3. Gjej user-in me token valid dhe që nuk ka skaduar
        // Token-i është i hash-uar në databazë, kështu që duhet të kontrollojmë me bcrypt.compare
        // Gjej të gjithë user-at që kanë resetPasswordToken dhe resetPasswordExpires > tani
        const users = await User.find({
            resetPasswordToken: { $exists: true },
            resetPasswordExpires: { $gt: new Date() }
        }).select('+resetPasswordToken');

        // 4. Kontrollo nëse token-i përputhet me ndonjë user
        let user = null;
        for (const u of users) {
            if (u.resetPasswordToken) {
                const isTokenValid = await bcrypt.compare(token, u.resetPasswordToken);
                if (isTokenValid) {
                    user = u;
                    break;
                }
            }
        }

        // 5. Nëse nuk gjendet user me token valid ose token-i ka skaduar, kthej gabim
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset link.'
            });
        }

        // Kontrollo sërish expiry time për siguri (edge case: nëse ka ndryshuar midis query dhe kontrollit)
        if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            // Fshi token-in e skaduar
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired. Please request a new password reset link.'
            });
        }

        // 6. Token-i është valid dhe nuk ka skaduar - përditëso password-in
        // Password-i do të hash-ohët automatikisht nga pre-save hook në User model
        user.password = password;
        
        // 7. Fshi token-in dhe expiry time (token-i është përdorur)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        // 8. Ruaj ndryshimet në databazë (password-i hash-ohet automatikisht)
        await user.save();

        // 9. Kthej përgjigje suksesi
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    register,
    login,
    checkEmail,
    checkUsername,
    verifyCode,
    resendCode,
    forgotPassword,
    resetPassword
};

