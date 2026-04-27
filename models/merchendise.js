const mongoose = require('mongoose');

const MerchandiseSchema = new mongoose.Schema({
    falcon_id: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String,
    },
    tshirt: {
        required: false,
        type: Number
    },
    trouser: {
        required: false,
        type: Number
    },
    jacket: {
        required: false,
        type: Number
    },
    delivery_bag: {
        required: false,
        type: Number
    },
    chest_guard: {
        required: false,
        type: Number
    },
    helmet: {
        required: false,
        type: Number
    },
    gloves: {
        required: false,
        type: Number
    },
    safety_gears: {
        required: false,
        type: Number
    },
    Box: {
        required: false,
        type: Number
    },
    summer_coat: {
        required: false,
        type: Number
    },

}, { timestamps: true })

module.exports = mongoose.model('Merchendise', MerchandiseSchema);