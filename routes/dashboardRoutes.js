// routes/dashboardRoutes.js
const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Dashboard data is for admin/manager
router.use(protect);
router.use(authorize(['admin', 'manager', "sub-admin"]));

router.get('/data', getDashboardData);

module.exports = router;