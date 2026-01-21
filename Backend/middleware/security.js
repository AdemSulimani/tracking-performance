const helmet = require('helmet');

// Security middleware configuration
// Helmet helps secure Express apps by setting various HTTP headers
const securityMiddleware = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    // X-Frame-Options: prevents clickjacking
    frameguard: { action: 'deny' },
    // X-Content-Type-Options: prevents MIME type sniffing
    noSniff: true,
    // X-XSS-Protection: enables XSS filter
    xssFilter: true,
    // Referrer-Policy: controls referrer information
    referrerPolicy: { policy: 'no-referrer' },
    // HSTS: forces HTTPS (only in production)
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
});

module.exports = securityMiddleware;

