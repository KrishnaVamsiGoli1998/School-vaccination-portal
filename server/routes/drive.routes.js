const express = require('express');
const router = express.Router();
const driveController = require('../controllers/drive.controller');

// Create a new vaccination drive
router.post('/', driveController.create);

// Retrieve all vaccination drives
router.get('/', driveController.findAll);

// Retrieve a single vaccination drive by ID
router.get('/:id', driveController.findOne);

// Update a vaccination drive
router.put('/:id', driveController.update);

// Delete a vaccination drive
router.delete('/:id', driveController.delete);

// Record vaccinations for students in a drive
router.post('/:id/vaccinate', driveController.recordVaccinations);

module.exports = router;