const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    falcon_id: {
        require: true,
        type: String
    },
    name: {
        require: true,
        type: String,
    },
    category: {
        require: true,
        type: String
    },
    online_orders: {
        require: true,
        type: Number
    },
    rate: {
        require: true,
        type: Number
    },
    petrol: {
        require: false,
        type: Number
    },
    bonus_amount: {
        require: false,
        type: Number
    },
    extra_kms_amount: {
        require: false,
        type: Number
    },
    violation: {
        require: false,
        type: Number
    },
    keeta: {
        require: false,
        type: Number,
        default: 0
    },
    total_deduction: {
        type: Number,
    },
    bike: {
        type: Number,
    },
    office: {
        type: Number,
    },
    sim: {
        type: Number,
    },
    total: {
        type: Number,
    },
    remaining_amount_to_collect: {
        type: Number,
    },
    uploading_date:{
        require: true,
        type: Date
    }

}, { timestamps: true })

// export const Employee = mongoose.model("Employee", EmployeeSchema)
module.exports = mongoose.model('Employee', EmployeeSchema);