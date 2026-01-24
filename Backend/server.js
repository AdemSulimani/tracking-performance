const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Security Middleware
// IMPORTANT: In production, ensure HTTPS is enabled
// Use a reverse proxy (nginx, Apache) or enable HTTPS directly
// Helmet sets various HTTP headers for security
const securityMiddleware = require('./middleware/security');
app.use(securityMiddleware);

// CORS Configuration
const normalizeOrigin = (value) => {
    if (!value) return value;
    return value.replace(/\/+$/, '');
};

const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

// Log allowed origins for debugging (only in non-production or if explicitly enabled)
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_CORS === 'true') {
    console.log('Allowed CORS origins:', allowedOrigins);
}

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const normalizedOrigin = normalizeOrigin(origin);
        
        // If FRONTEND_URL is set, use it (production mode)
        if (allowedOrigins.length > 0) {
            if (allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            } else {
                // Log for debugging
                if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_CORS === 'true') {
                    console.log('CORS blocked origin:', normalizedOrigin);
                    console.log('Allowed origins:', allowedOrigins);
                }
                return callback(new Error('Not allowed by CORS'));
            }
        }
        
        // If no FRONTEND_URL is set, allow localhost in development
        if (process.env.NODE_ENV !== 'production') {
            if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true);
            }
        }
        
        // Default: deny if no configuration
        callback(new Error('Not allowed by CORS - no FRONTEND_URL configured'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Body Parser Middleware
// Limit JSON payload size to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General API Rate Limiting
// Protects all endpoints from abuse
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Tracking Performance API is running' });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Route ${req.originalUrl} not found`,
        method: req.method
    });
});

// Start server
const PORT = process.env.PORT || 3000;

// SECURITY NOTE: In production, use HTTPS
// Option 1: Use a reverse proxy (nginx, Apache) with SSL certificate
// Option 2: Enable HTTPS directly in Node.js:
//   const https = require('https');
//   const fs = require('fs');
//   const options = {
//     key: fs.readFileSync('path/to/private-key.pem'),
//     cert: fs.readFileSync('path/to/certificate.pem')
//   };
//   https.createServer(options, app).listen(PORT);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log('⚠️  WARNING: Running in development mode. Use HTTPS in production!');
        }
    });
}

module.exports = app;

