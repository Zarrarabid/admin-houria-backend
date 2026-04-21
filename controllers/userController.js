// controllers/userController.js
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs'); // <--- ADD THIS LINE


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    // console.log("getttt"); // Can remove this log now

    const { page = 1, limit = 10, search = '' } = req.query; // Default values
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
        let query = {};
        if (search) {
            // Case-insensitive search on username and email
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Count total users matching the search query
        const totalUsers = await User.countDocuments(query);

        // Fetch users with pagination, search, and populate role
        const users = await User.find(query)
            .populate('role', 'name') // Only populate the 'name' field of the role
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 }); // Optional: sort by creation date, newest first

        res.status(200).json({
            users: users,
            totalUsers: totalUsers,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalUsers / parseInt(limit))
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

exports.createUser = async (req, res) => {
    const { username, email, password, role, isActive = true } = req.body;

    // 1. Basic Validation
    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all required fields: username, email, password, and role.' });
    }

    try {
        // 2. Check for existing user
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with that username or email already exists.' });
        }

        // 3. Find the role by its ID
        const foundRole = await Role.findById(role);
        if (!foundRole) {
            return res.status(400).json({ message: 'Invalid role ID provided.' });
        }

        // 4. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create new user instance
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: foundRole._id, // Store the ObjectId of the role
            isActive
        });

        // 6. Save user to database
        await newUser.save();

        // 7. Respond with the created user (excluding password)
        const userWithoutPassword = await User.findById(newUser._id).select('-password').populate('role', 'name');

        res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Error in createUser:", error);
        // Handle specific Mongoose validation errors if needed
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error creating user' });
    }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role', 'name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user (including role)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    const { username, email, roleName, isActive } = req.body; // Don't allow password update here directly

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (username) user.username = username;
        if (email) user.email = email;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        // Handle role update
        if (roleName) {
            const newRole = await Role.findOne({ name: roleName });
            if (!newRole) {
                return res.status(400).json({ message: 'Invalid role specified' });
            }
            user.role = newRole._id;
        }

        await user.save();
        const updatedUser = await User.findById(user._id).populate('role', 'name');

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        // Handle unique constraint errors (e.g., duplicate username/email)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or email already in use' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Activate/Deactivate a user
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res) => {
    const { isActive } = req.body;

    // Validate isActive is a boolean
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean value (true/false)' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();
        const updatedUser = await User.findById(user._id).populate('role', 'name');

        res.status(200).json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.deleteOne({ _id: req.params.id }); // Using deleteOne for clarity
        res.status(200).json({ message: 'User removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};