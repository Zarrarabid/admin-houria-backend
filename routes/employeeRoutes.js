// routes/itemRoutes.js
const express = require('express');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../utils/multer');
const { addBulkEmployee, getAllEmployee, updateEmployeeRecord } = require('../controllers/employee.controller');

const router = express.Router();

router.route("/")
.get(protect,getAllEmployee)
.post(protect,addBulkEmployee)

// router.route('/')
//     .get(getAllItems)
//     // .post(protect, authorize(['admin', 'manager']), upload.single("image"), createItem);
//     .post(protect, upload.single("image"), createItem);

router.route('/:id')
    .put(protect, updateEmployeeRecord)

// router.route('/:id/status')
//     .patch(toggleItemStatus); // Delete a role

module.exports = router;