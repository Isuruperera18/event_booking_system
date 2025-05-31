// routes/userRoutes.js
const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Example: Get current user's profile
router.get('/profile', protect, getUserProfile);

// Admin routes for user management can be added here later
// router.get('/', protect, authorize('Admin'), getAllUsers);
// router.route('/:id')
//     .get(protect, authorize('Admin'), getUserById)
//     .put(protect, authorize('Admin'), updateUser)
//     .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;