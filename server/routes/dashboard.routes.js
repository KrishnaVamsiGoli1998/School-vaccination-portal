const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authJwt } = require('../middleware');

// Apply authentication middleware to all routes
router.use(authJwt.verifyToken);

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get recent vaccination drives
router.get('/recent-drives', dashboardController.getRecentDrives);

// Get upcoming vaccination drives
router.get('/upcoming-drives', dashboardController.getUpcomingDrives);

module.exports = router;