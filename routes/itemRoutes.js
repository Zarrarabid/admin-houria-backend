// routes/itemRoutes.js
const express = require('express');
const {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    toggleItemStatus
} = require('../controllers/itemController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../utils/multer');

const router = express.Router();

router.route('/')
    .get(getAllItems)
    // .post(protect, authorize(['admin', 'manager']), upload.single("image"), createItem);
    .post(protect, upload.single("image"), createItem);

router.route('/:id')
    .get(getItemById)
    // .put(protect, authorize(['admin', 'manager']), upload.single("image"), updateItem)
    .put(protect, upload.single("image"), updateItem)
    .delete(protect, authorize('admin'), deleteItem);

router.route('/:id/status')
    .patch(toggleItemStatus); // Delete a role

module.exports = router;