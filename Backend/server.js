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
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In development, allow all localhost origins
        if (process.env.NODE_ENV !== 'production') {
            // Allow any localhost origin in development
            if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true);
            }
        }
        
        // Normalize origin (remove trailing slash)
        const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
        
        // In production, use specific allowed origins
        const allowedOrigins = [];
        
        // Add FRONTEND_URL if set (normalize it too)
        if (process.env.FRONTEND_URL) {
            const normalizedFrontendUrl = process.env.FRONTEND_URL.endsWith('/') 
                ? process.env.FRONTEND_URL.slice(0, -1) 
                : process.env.FRONTEND_URL;
            allowedOrigins.push(normalizedFrontendUrl);
            
            // Also allow any Vercel subdomain if FRONTEND_URL is a Vercel domain
            if (normalizedFrontendUrl.includes('.vercel.app')) {
                // Allow any Vercel app domain (including preview deployments)
                allowedOrigins.push(new RegExp(`^https://[^/]+\.vercel\.app$`));
            }
        }
        
        // Log for debugging
        console.log('CORS check - Origin:', normalizedOrigin);
        console.log('CORS check - Allowed origins:', allowedOrigins);
        
        if (allowedOrigins.length === 0) {
            console.warn('⚠️  WARNING: No FRONTEND_URL set in environment variables. CORS may block requests.');
            return callback(new Error('No FRONTEND_URL configured'));
        }
        
        // Check if origin matches any allowed origin
        let isAllowed = false;
        for (const allowedOrigin of allowedOrigins) {
            if (typeof allowedOrigin === 'string') {
                if (normalizedOrigin === allowedOrigin) {
                    isAllowed = true;
                    break;
                }
            } else if (allowedOrigin instanceof RegExp) {
                if (allowedOrigin.test(normalizedOrigin)) {
                    isAllowed = true;
                    break;
                }
            }
        }
        
        if (isAllowed) {
            console.log('✅ CORS allowed for origin:', normalizedOrigin);
            callback(null, true);
        } else {
            console.error('❌ CORS blocked origin:', normalizedOrigin);
            console.error('Expected one of:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
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
const PORT = process.env.PORT || 5000;

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

