// routes/bookingRoutes.js
const express = require('express');
const {
    BookEvent,
    getMyBookings,
    getAllBookings,
    getBooking,
    cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Book an event (user only)
router.post('/', protect, BookEvent);

// Get all bookings (admin only)
router.get('/all', protect, authorize('Admin'), getAllBookings);

// Get logged-in user's bookings
router.get('/my', protect, getMyBookings);

// Get a single booking by ID (user or admin)
router.get('/:id', protect, getBooking);

// Cancel a booking
router.delete('/:id', protect, cancelBooking);

module.exports = router;
