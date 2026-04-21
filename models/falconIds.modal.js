const mongoose = require('mongoose');

const FalconIDsSchema = new mongoose.Schema({
    falcon_id_holder: {
        required: true,
        type: String
    },
    name_of_id_holder: {
        required: true,
        type: String,
    },
    falcon_id_given_to: {
        required: true,
        type: String
    },
    COD: {
        required: true,
        type: Number
    },
    total_orders: {
        required: true,
        type: Number
    },
    to_Date: {
        required: false,
        type: Date
    },
    from_Date: {
        required: false,
        type: Date
    },

}, { timestamps: true })

// export const Employee = mongoose.model("Employee", EmployeeSchema)
module.exports = mongoose.model('FalconIDs', FalconIDsSchema);