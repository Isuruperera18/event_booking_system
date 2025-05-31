// routes/eventRoutes.js
const express = require('express');
const {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
} = require('../controllers/eventController');
const { protect, optionalProtect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.route('/')
    .get(optionalProtect, getEvents) // Public
    .post(protect, authorize('Organizer', 'Admin'),upload.single('imageFile'), createEvent); // Only Organizers or Admins can create

router.route('/:id')
    .get(getEvent) // Public
    .put(protect, authorize('Organizer', 'Admin'), updateEvent) // Only Organizer of the event or Admin can update
    .delete(protect, authorize('Organizer', 'Admin'), deleteEvent); // Only Organizer of the event or Admin can delete

module.exports = router;