// models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Engine Parts', 'Interior', 'Exterior', 'Electronics', 'Tires & Wheels', 'Tools', 'Fluids & Chemicals', 'Other']
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    imageUrl: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

ItemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Item', ItemSchema);