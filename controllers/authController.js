const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtConfig = require('../config/jwt');


// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, jwtConfig.secret, { 
        expiresIn: jwtConfig.expiresIn,         
    });
};


exports.registerUser = async (req, res) => {
    const { username, email, password, roleName } = req.body;
    console.log("asdasd")

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User with this username already exists' });
        }

        // Find the role
        const role = await Role.findOne({ name: roleName || 'user' }); // Default to 'user' role
        if (!role) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        user = new User({
            username,
            email,
            password,
            role: role._id
        });

        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: role.name,
                isActive: user.isActive
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user
        const user = await User.findOne({ email }).populate('role', 'name');

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account is deactivated. Please contact support.' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role.name, // Populated role name
                isActive: user.isActive
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};