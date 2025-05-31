const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.BookEvent = async (req, res, next) => {
  try {
    const newBooking = new Booking({
      userId: req.user.id,
      eventId: req.body.eventId
    });

    await newBooking.save();

    // Update the event's attendees array
await Event.findByIdAndUpdate(
  req.body.eventId,
  { $addToSet: { attendees: new mongoose.Types.ObjectId(req.user.id) } },
  { new: true }
);


    res.status(201).json({ success: true, data: newBooking });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getMyBookings = async (req, res) => {
    try {
        const myBookings = await Booking.find({ userId: req.user.id }).populate("eventId");

        res.status(200).json({
            success: true,
            data: myBookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const allBookings = await Booking.find()
            .populate("eventId")
            .populate("userId", "name email"); // show user name & email

        res.status(200).json({
            success: true,
            data: allBookings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// Get a single booking by ID (user or admin)
exports.getBooking = async (req, res) => {
    try {
        const getBooking = await Booking.findById(req.params.id)
            .populate("eventId")
            .populate("userId", "name email");

        if (!getBooking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Allow access only if user owns the booking or is admin
        if (getBooking.userId._id.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: "Not authorized to view this booking" });
        }

        res.status(200).json({ success: true, data: getBooking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Cancel a booking by ID (user or admin)
exports.cancelBooking = async (req, res) => {
    try {
        const cancelBooking = await Booking.findById(req.params.id);

        if (!cancelBooking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Allow delete only if user owns the booking or is admin
        if (cancelBooking.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
        }

        await cancelBooking.remove();

        res.status(200).json({ success: true, message: "Booking cancelled successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
