// controllers/eventController.js
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Multer config for file upload handling (store in temp folder)
const upload = multer({ dest: "temp/" });

// Your Imgbb API key here
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

// Middleware to handle single image upload with multer
exports.uploadEventImage = upload.single("image");

exports.createEvent = async (req, res, next) => {
  try {
    // 1. Upload to ImgBB
    if (req.file) {
      const imageBase64 = req.file.buffer.toString("base64");

      // ImgBB expects data as 'application/x-www-form-urlencoded'
      // We can use URLSearchParams for this
      const formData = new URLSearchParams();
      formData.append("image", imageBase64);
      // formData.append('name', req.file.originalname); // Optional: set a name for the image on ImgBB

      console.log("Uploading to ImgBB...");
      const imgbbResponse = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!imgbbResponse.data || !imgbbResponse.data.success) {
        console.error("ImgBB Upload Error:", imgbbResponse.data);
        return res.status(500).json({
          message: "Failed to upload image to ImgBB",
          error: imgbbResponse.data,
        });
      }

      const imgbbData = imgbbResponse.data.data;
      const imageUrl = imgbbData.url; // Direct link to the image
      console.log("ImgBB Upload successful:", imageUrl);

      req.body.imageURL = imageUrl;
    } else {
      req.body.imageURL = "https://i.ibb.co/Q7p33kKv/default.jpg";
    }
    req.body.organizer = req.user.id;

    const event = await Event.create(req.body);

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    console.error(err);
    // Cleanup temp file if exists on error
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, "..", req.file.path));
      } catch {}
    }

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const oneHourAgoNow = new Date(Date.now() - 60 * 60 * 1000);

    const events = await Event.find({
      status: { $nin: ["cancelled", "completed"] },
      date: { $gte: oneHourAgoNow },
    }).populate("organizer", "name email");

    const userId = req.user?.id || null;

    const eventsWithAvailability = await Promise.all(
      events.map(async (event) => {
        // Calculate total booked tickets
        const bookingAgg = await Booking.aggregate([
          { $match: { event: new mongoose.Types.ObjectId(event._id) } },
          { $group: { _id: null, totalTickets: { $sum: "$tickets" } } },
        ]);
        const bookedCount = bookingAgg[0]?.totalTickets || 0;
        const availableTickets =
          event.capacity > 0 ? event.capacity - bookedCount : Infinity;

        let eventData = {
          ...event.toObject(),
          bookedCount,
          availableTickets: availableTickets <= 0 ? 0 : availableTickets,
        };

        // If logged in, fetch booking
        if (userId) {
          const userBooking = await Booking.findOne({
            event: event._id,
            user: userId,
            status: "booked", // only consider booked status
          })
            .sort({ createdAt: -1 }) // get the latest one
            .select("_id status"); // only return _id and status

          eventData.booking = userBooking || null;
        }

        return eventData;
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithAvailability.length,
      data: eventsWithAvailability,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;

    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email"
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }

    const bookingAgg = await Booking.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(event._id) } },
      { $group: { _id: null, totalTickets: { $sum: "$tickets" } } },
    ]);
    const bookedCount = bookingAgg[0]?.totalTickets || 0;
    const availableTickets =
      event.capacity > 0 ? event.capacity - bookedCount : Infinity;

    const eventData = {
      ...event.toObject(),
      availableTickets: availableTickets < 0 ? 0 : availableTickets,
    };

    if (userId) {
      const userBooking = await Booking.findOne({
        event: event._id,
        user: userId,
      }).select("_id, status");

      eventData.bookedTickets = bookedCount;
      eventData.booking = userBooking ? userBooking : null;
    }

    res.status(200).json({
      success: true,
      data: eventData,
    });
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is the event owner or an Admin
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this event`,
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    if (err.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is the event owner or an Admin
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this event`,
      });
    }

    await event.deleteOne(); // Use deleteOne instead of remove for Mongoose v6+

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`,
      });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
