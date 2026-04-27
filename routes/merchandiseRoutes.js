// routes/itemRoutes.js
const express = require('express');
const protect = require('../middleware/authMiddleware');
const upload = require('../utils/multer');
const { createMerchendise, updateMerchandise, getAllMerchandise } = require('../controllers/merchendiseController');

const router = express.Router();

router.route("/")
.get(protect,getAllMerchandise)
.post(protect,createMerchendise)

router.route('/:id')
    .put(protect, updateMerchandise)
    
module.exports = router;