// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config(); // Load .env file variables

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Enable CORS
app.use(cors()); // Allows all origins by default

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/users', userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// Basic error handling (can be improved with a dedicated error handler middleware)
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});


const PORT = process.env.PORT || 5001;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});