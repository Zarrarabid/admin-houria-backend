// models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'manager', 'sub-admin']
    },
    description: {
        type: String,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('Role', RoleSchema);