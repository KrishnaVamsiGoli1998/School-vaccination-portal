const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, 'students-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Create a new student
router.post('/', studentController.create);

// Bulk import students from CSV
router.post('/bulk-import', upload.single('file'), studentController.bulkImport);

// Retrieve all students
router.get('/', studentController.findAll);

// Retrieve a single student by ID
router.get('/:id', studentController.findOne);

// Update a student
router.put('/:id', studentController.update);

// Delete a student
router.delete('/:id', studentController.delete);

module.exports = router;