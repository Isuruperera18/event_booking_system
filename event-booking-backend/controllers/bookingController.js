const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

exports.BookEvent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { eventId, tickets } = req.body;

    if (!eventId || !tickets || tickets < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid eventId or tickets count" });
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // Check total booked tickets for the event
    const totalBooked = await Booking.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      { $group: { _id: null, totalTickets: { $sum: "$tickets" } } },
    ]);
    const bookedCount = totalBooked[0]?.totalTickets || 0;

    // Check capacity availability
    const availableTickets = event.capacity - bookedCount;
    if (availableTickets < tickets) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableTickets} tickets available`,
      });
    }

    // Check if user already booked for the event
    const existingBooking = await Booking.findOne({ eventId, userId });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked for this event",
      });
    }

    // Create new booking
    const newBooking = new Booking({
      user: userId, // <-- use 'user' not 'userId'
      event: eventId, // <-- use 'event' not 'eventId'
      tickets,
    });

    await newBooking.save();

    // Add user to event attendees if not already added
    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
    }

    res.status(201).json({ success: true, data: newBooking });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const myBookings = await Booking.find({ userId: req.user.id }).populate(
      "eventId"
    );

    res.status(200).json({
      success: true,
      data: myBookings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const myBookings = await Booking.find({ user: req.user.id })
      .populate({
        path: "event",
        select: "title description date time venue imageUrl capacity organizer", // Add any fields you want from the Event
        populate: {
          path: "organizer",
          select: "name email",
        }
      });

    res.status(200).json({
      success: true,
      count: myBookings.length,
      data: myBookings,
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
      data: allBookings,
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
      .populate("event")
      .populate("user", "name email");

    if (!getBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Allow access only if user owns the booking or is admin
    if (
      getBooking.user._id.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({ success: true, data: getBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only allow owner or admin to cancel
    if (
      booking.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Update booking status to cancelled
    booking.status = "cancelled";
    await booking.save();

    // Optionally remove user from attendees list in the Event model
    await Event.findByIdAndUpdate(booking.event, {
      $pull: { attendees: booking.user },
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled and status updated",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
