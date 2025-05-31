const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();
connectDB();

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/users', userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    res.status(err.statusCode || 500).send({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
