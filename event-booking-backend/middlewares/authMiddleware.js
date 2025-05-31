// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) { // Alternative: token from cookie
    //     token = req.cookies.token;
    // }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route (no token)' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded ", decoded)
        req.user = await User.findById(decoded.id);
        if (!req.user) {
             return res.status(401).json({ success: false, message: 'User not found' });
        }
        next();
    } catch (err) {
        console.error('JWT Error:', err);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route (token failed)' });
    }
};

exports.optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // ignore invalid token; req.user stays undefined
    }
  }
  next();
};


// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`
            });
        }
        next();
    };
};