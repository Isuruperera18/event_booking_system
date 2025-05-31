// controllers/eventController.js
const Event = require("../models/Event");
const User = require("../models/User"); // If needed for validation or population
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

// @desc    Create new event with image upload to Imgbb
// @route   POST /api/v1/events
// @access  Private (Organizer or Admin)
exports.createEvent = async (req, res, next) => {
  try {
    if (req.file) {
      // Read image file from temp folder and convert to base64
      const imagePath = path.join(__dirname, "..", req.file.path);
      const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

      // Upload to Imgbb
      const imgbbResponse = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          image: imageBase64,
        }
      );

      // Delete temp file after upload
      fs.unlinkSync(imagePath);

      if (
        !imgbbResponse.data ||
        !imgbbResponse.data.data ||
        !imgbbResponse.data.data.url
      ) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload image to Imgbb" });
      }

      // Add organizer and image URL to event data
      req.body.imageURL = imgbbResponse.data.data.url; // URL from Imgbb response
    }
    req.body.imageURL = "https://i.ibb.co/Q7p33kKv/default.jpg";
    req.body.organizer = req.user.id;
    // Create event with other data (price, currency, seats, etc.) in req.body
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

// @desc    Get all events (publicly accessible, can be filtered later)
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    // Basic search and filter can be added here later (Phase 5)
    const events = await Event.find().populate("organizer", "name email"); // Populate organizer details
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email"
    );
    if (!event) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
    }
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    console.error(err);
    // Handle CastError if ID is not a valid ObjectId
    if (err.name === "CastError") {
      return res
        .status(404)
        .json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private (Organizer or Admin)
// exports.createEvent = async (req, res, next) => {
//     try {
//         // Add logged-in user as the organizer
//         req.body.organizer = req.user.id;

//         const event = await Event.create(req.body);
//         res.status(201).json({ success: true, data: event });
//     } catch (err) {
//         console.error(err);
//         if (err.name === 'ValidationError') {
//             const messages = Object.values(err.errors).map(val => val.message);
//             return res.status(400).json({ success: false, message: messages });
//         }
//         res.status(500).json({ success: false, message: 'Server Error' });
//     }
// };

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private (Organizer of this event or Admin)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
    }

    // Make sure user is the event owner or an Admin
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res
        .status(401)
        .json({
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
      return res
        .status(404)
        .json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private (Organizer of this event or Admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
    }

    // Make sure user is the event owner or an Admin
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message: `User ${req.user.id} is not authorized to delete this event`,
        });
    }

    await event.deleteOne(); // Use deleteOne instead of remove for Mongoose v6+

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res
        .status(404)
        .json({
          success: false,
          message: `Event not found with id of ${req.params.id}`,
        });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
