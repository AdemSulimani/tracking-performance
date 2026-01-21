const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error('MONGODB_URL is not defined in environment variables');
        }

        // Mongoose 6+ doesn't need useNewUrlParser and useUnifiedTopology
        const conn = await mongoose.connect(process.env.MONGODB_URL);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        console.error('Please check your MONGODB_URL in .env file');
        process.exit(1);
    }
};

module.exports = connectDB;

