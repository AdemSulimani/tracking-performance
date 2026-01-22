const express = require('express');
const router = express.Router();
const { register, login, checkEmail, checkUsername, verifyCode, resendCode } = require('../controllers/authController');
const { loginLimiter, registerLimiter, verifyCodeLimiter, resendCodeLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/inputSanitizer');

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

module.exports = router;

