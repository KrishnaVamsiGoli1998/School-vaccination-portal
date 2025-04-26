const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Demo login (hardcoded for testing)
router.post('/demo-login', authController.demoLogin);

module.exports = router;