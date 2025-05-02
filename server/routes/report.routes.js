const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authJwt } = require('../middleware');

// Apply authentication middleware to all routes
router.use(authJwt.verifyToken);

// Generate vaccination report
router.get('/generate', reportController.generateReport);

// Get vaccination statistics
router.get('/statistics', reportController.getStatistics);

// Export vaccination data as CSV
router.get('/export', reportController.exportData);

module.exports = router;