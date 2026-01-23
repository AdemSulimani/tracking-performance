const express = require('express');
const router = express.Router();
const { register, login, checkEmail, checkUsername, verifyCode, resendCode, forgotPassword, resetPassword, googleAuth, googleAuthCallback, googleAuthState, updateCompanyType } = require('../controllers/authController');
const { loginLimiter, registerLimiter, verifyCodeLimiter, resendCodeLimiter, forgotPasswordLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/inputSanitizer');
const { authenticate } = require('../middleware/auth');

// Apply input sanitization to all routes
router.use(sanitizeInput);

// POST /api/auth/register — për regjistrim
// Rate limited: 3 attempts per hour per IP
router.post('/register', registerLimiter, register);

// POST /api/auth/login — për login
// Rate limited: 5 attempts per 15 minutes per IP
router.post('/login', loginLimiter, login);

// POST /api/auth/verify-code — për verifikim të kodit
// Rate limited: 5 attempts per 15 minutes per IP
router.post('/verify-code', verifyCodeLimiter, verifyCode);

// POST /api/auth/resend-code — për dërgim të kodit të ri
// Rate limited: 3 attempts per 15 minutes per IP
router.post('/resend-code', resendCodeLimiter, resendCode);

// GET /api/auth/check-email/:email — për kontroll të email-it (opsionale)
router.get('/check-email/:email', checkEmail);

// GET /api/auth/check-username/:username — për kontroll të username-it
router.get('/check-username/:username', checkUsername);

// POST /api/auth/forgot-password — për kërkim të reset password
// Rate limited: 3 attempts per hour per IP
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

// POST /api/auth/reset-password — për reset password me token
// Rate limited: 5 attempts per 15 minutes per IP
router.post('/reset-password', resetPasswordLimiter, resetPassword);

// POST /api/auth/google — për Google OAuth login/register (legacy - përdoret nga frontend)
// Rate limited: 10 attempts per 15 minutes per IP
router.post('/google', loginLimiter, googleAuth);

// POST /api/auth/google/state — për të ruajtur OAuth state (për CSRF protection)
// Frontend dërgon state këtu para se të fillojë OAuth flow
router.post('/google/state', googleAuthState);

// GET /api/auth/google/callback — për Google OAuth callback (backend redirect URI)
// Google do të redirect-ojë këtu me authorization code
router.get('/google/callback', googleAuthCallback);

// POST /api/auth/update-company-type — për update company type (për Google users)
// Protected route - requires authentication
router.post('/update-company-type', authenticate, updateCompanyType);

module.exports = router;

