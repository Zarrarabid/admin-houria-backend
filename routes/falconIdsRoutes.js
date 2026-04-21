// routes/itemRoutes.js
const express = require('express');
const protect = require('../middleware/authMiddleware');
const upload = require('../utils/multer');
const { createFalconIds, getAllFalconIds, updateFalconIds } = require('../controllers/falconIdsController');

const router = express.Router();

router.route("/")
.get(protect,getAllFalconIds)
.post(protect,createFalconIds)

// router.route('/')
//     .get(getAllItems)
//     // .post(protect, authorize(['admin', 'manager']), upload.single("image"), createItem);
//     .post(protect, upload.single("image"), createItem);

router.route('/:id')
    // .get(getItemById)
    // .put(protect, authorize(['admin', 'manager']), upload.single("image"), updateItem)
    .put(protect, updateFalconIds)
    // .delete(protect, authorize('admin'), deleteItem);

// router.route('/:id/status')
//     .patch(toggleItemStatus); // Delete a role

module.exports = router;