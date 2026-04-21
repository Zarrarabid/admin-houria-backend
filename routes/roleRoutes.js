// routes/roleRoutes.js
const express = require('express');
const { createRole, getAllRoles, deleteRole, updateRole, toggleRoleStatus } = require('../controllers/roleController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Role management routes are only for admin
router.use(protect);
// router.use(authorize('admin'));

router.route('/')
    .post(createRole)  // Create a new role
    .get(getAllRoles); // Get all roles

router.route('/:id')
    .delete(deleteRole) // Delete a role
    .put(updateRole); // Delete a role

router.route('/:id/status')
    .patch(toggleRoleStatus); // Delete a role

module.exports = router;