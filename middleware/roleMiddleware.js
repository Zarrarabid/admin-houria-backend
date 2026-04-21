// middleware/roleMiddleware.js
const Role = require('../models/Role');

const authorize = (roles = []) => {
    console.log("asdasdasd")
    // roles param can be a single role string or an array of roles
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return async (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied. No user or role found.' });
        }

        try {
            const userRole = await Role.findById(req.user.role);

            if (!userRole) {
                return res.status(403).json({ message: 'Access denied. User role not found.' });
            }

            // Check if the user's role is included in the allowed roles
            if (roles.length && !roles.includes(userRole.name)) {
                return res.status(403).json({ message: 'Access denied. Insufficient role.' });
            }

            next(); // User has the required role
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error during role authorization.' });
        }
    };
};

module.exports = authorize;