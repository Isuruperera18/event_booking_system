const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tickets: { type: Number, required: true, min: 1 },
  bookedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
