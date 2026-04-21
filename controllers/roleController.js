// controllers/roleController.js
const Role = require('../models/Role');

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/Admin
exports.createRole = async (req, res) => {
    const { role_name, description } = req.body;

    try {
        // Ensure role name is lowercase and valid (e.g., 'admin', 'manager', 'user')
        const roleNameLower = role_name?.toLowerCase();
        if (!['admin', 'manager', 'sub-admin'].includes(roleNameLower)) {
            return res.status(400).json({ message: 'Invalid role name. Must be admin, manager, or sub-admin.' });
        }

        const roleExists = await Role.findOne({ name: roleNameLower });
        if (roleExists) {
            return res.status(400).json({ message: 'Role with this name already exists' });
        }

        const role = new Role({
            name: roleNameLower,
            description
        });
        await role.save();
        res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
exports.getAllRoles = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query; // Default values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        let query = {};
        if (search) {
            // Case-insensitive search on username and email
            query = {
                $or: [
                    { role: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const totalrolesCount = await Role.countDocuments(query)
        const roles = await Role.find(query).limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });
        res.status(200).json(
            {
                roles: roles,
                totalRoles: totalrolesCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalrolesCount / parseInt(limit))
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRole = async (req, res) => {
    // Destructure all expected fields from the request body, including isActive
    const { role_name, description, isActive } = req.body;
    const { id } = req.params; // Get ID from URL parameters

    try {
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        let updatedRoleName = role.name; // Default to existing name

        // --- Handle role_name update ---
        if (role_name !== undefined) { // Check if role_name is provided (can be an empty string)
            updatedRoleName = role_name.toLowerCase();

            // Validate new role name if it's being changed
            if (!['admin', 'manager', 'sub-admin'].includes(updatedRoleName)) {
                return res.status(400).json({ message: 'Invalid role name. Must be admin, manager, or sub-admin.' });
            }

            // Check if the new role name already exists for another role
            if (updatedRoleName !== role.name) { // Only check if the name is actually changing
                const roleExists = await Role.findOne({ name: updatedRoleName });
                if (roleExists && String(roleExists._id) !== id) { // Ensure it's not the current role
                    return res.status(400).json({ message: 'Role with this name already exists' });
                }
            }
            role.name = updatedRoleName;
        }

        // --- Handle description update ---
        if (description !== undefined) { // Check if description is provided
            role.description = description;
        }

        // --- Handle isActive update ---
        // Ensure isActive is explicitly a boolean before assigning
        if (typeof isActive === 'boolean') {
            role.isActive = isActive;
        }

        await role.save(); // Save the updated role
        res.status(200).json({ message: 'Role updated successfully', role });

    } catch (error) {
        console.error("Error in updateRole:", error);
        // Handle unique constraint errors if any
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A role with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a role (careful with this in production!)
// @route   DELETE /api/roles/:id
// @access  Private/Admin
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        // Add logic here to prevent deleting default roles if needed
        await Role.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Role removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleRoleStatus = async (req, res) => {
    const { isActive } = req.body;
    const { id } = req.params;

    // Validate isActive is explicitly a boolean
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean value (true/false)' });
    }

    try {
        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Prevent deactivating critical roles if needed (e.g., the 'admin' role itself)
        // if (role.name === 'admin' && isActive === false) {
        //     return res.status(403).json({ message: 'Cannot deactivate the primary "admin" role.' });
        // }

        role.isActive = isActive; // Update the status
        await role.save(); // Save the changes

        res.status(200).json({
            message: `Role ${isActive ? 'activated' : 'deactivated'} successfully`,
            role: role // Send back the updated role
        });

    } catch (error) {
        console.error("Error in toggleRoleStatus:", error);
        res.status(500).json({ message: 'Server error' });
    }
};