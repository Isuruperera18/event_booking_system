// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    console.log(req.body)
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password,
            role // Role can be 'Attendee', 'Organizer', 'Admin'
        });

        const token = generateToken(user._id);
        res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    // req.user is set by the 'protect' middleware
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};