// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const jwtConfig = require('../config/jwt'); // <--- Import the config


const protect = async (req, res, next) => {
    let token;
    console.log("pppppppppppp")

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get token from header

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

            // Attach user to the request object (without password)
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = protect;