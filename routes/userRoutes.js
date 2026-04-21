// routes/userRoutes.js
const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    createUser
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// All user routes require authentication and admin role
router.use(protect); // Protect all routes in this router
// router.use(authorize('admin', "sub-admin")); // Only admin can access user management

router.route('/')
    .get(getAllUsers) // Get all users
    .post(createUser); // Get all users

router.route('/:id')
    .get(getUserById)       // Get single user by ID
    .put(updateUser)        // Update user details (including role)
    .delete(deleteUser);    // Delete a user

router.patch('/:id/status', toggleUserStatus); // Activate/Deactivate user status

module.exports = router;