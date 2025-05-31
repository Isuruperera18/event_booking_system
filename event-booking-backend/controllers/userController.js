// controllers/userController.js
const User = require('../models/User');

// @desc    Get user profile (example for user-specific data)
// @route   GET /api/v1/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    try {
        // req.user is populated by the 'protect' middleware
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// More admin-specific user management (CRUD for users by admin) can be added later
// For example:
// exports.getAllUsers = async (req, res, next) => { ... } // Admin only
// exports.getUserById = async (req, res, next) => { ... } // Admin only
// exports.updateUser = async (req, res, next) => { ... } // Admin only
// exports.deleteUser = async (req, res, next) => { ... } // Admin only