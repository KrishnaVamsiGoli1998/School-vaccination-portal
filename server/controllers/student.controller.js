const db = require('../models');
const Student = db.student;
const Vaccination = db.vaccination;
const VaccinationDrive = db.vaccinationDrive;
const { Op } = require('sequelize');
const fs = require('fs');
const csv = require('csv-parser');

// Create a new student
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.studentId || !req.body.grade) {
      return res.status(400).send({
        message: 'Name, Student ID, and Grade are required fields!'
      });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({
      where: { studentId: req.body.studentId }
    });

    if (existingStudent) {
      return res.status(400).send({
        message: 'Student ID already exists!'
      });
    }

    // Create a new student
    const student = await Student.create({
      studentId: req.body.studentId,
      name: req.body.name,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      grade: req.body.grade,
      section: req.body.section,
      parentName: req.body.parentName,
      contactNumber: req.body.contactNumber,
      address: req.body.address
    });

    res.status(201).send(student);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while creating the student.'
    });
  }
};

// Retrieve all students
exports.findAll = async (req, res) => {
  try {
    const { name, grade, studentId, vaccinationStatus, vaccineId } = req.query;
    let condition = {};
    
    // Apply filters if provided
    if (name) {
      condition.name = { [Op.iLike]: `%${name}%` };
    }
    
    if (grade) {
      // Handle comma-separated list of grades
      if (grade.includes(',')) {
        const grades = grade.split(',').map(g => g.trim());
        condition.grade = { [Op.in]: grades };
      } else {
        condition.grade = grade;
      }
    }
    
    if (studentId) {
      condition.studentId = { [Op.iLike]: `%${studentId}%` };
    }

    // Get all students with the condition
    let students = await Student.findAll({ 
      where: condition,
      include: [{
        model: Vaccination,
        as: 'vaccinations',
        include: [{
          model: VaccinationDrive,
          as: 'drive'
        }]
      }]
    });

    // Filter by vaccination status if requested
    if (vaccinationStatus === 'vaccinated' && vaccineId) {
      students = students.filter(student => 
        student.vaccinations.some(v => v.driveId.toString() === vaccineId)
      );
    } else if (vaccinationStatus === 'not-vaccinated' && vaccineId) {
      students = students.filter(student => 
        !student.vaccinations.some(v => v.driveId.toString() === vaccineId)
      );
    }

    res.send(students);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving students.'
    });
  }
};

// Find a single student by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const student = await Student.findByPk(id, {
      include: [{
        model: Vaccination,
        as: 'vaccinations',
        include: [{
          model: VaccinationDrive,
          as: 'drive'
        }]
      }]
    });
    
    if (!student) {
      return res.status(404).send({
        message: `Student with id ${id} not found.`
      });
    }
    
    res.send(student);
  } catch (error) {
    res.status(500).send({
      message: `Error retrieving student with id ${req.params.id}`
    });
  }
};

// Update a student
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const [num] = await Student.update(req.body, {
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: 'Student was updated successfully.'
      });
    } else {
      res.send({
        message: `Cannot update student with id=${id}. Maybe student was not found or req.body is empty!`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Error updating student with id=${req.params.id}`
    });
  }
};

// Delete a student
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await Student.destroy({
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: 'Student was deleted successfully!'
      });
    } else {
      res.send({
        message: `Cannot delete student with id=${id}. Maybe student was not found!`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Could not delete student with id=${req.params.id}`
    });
  }
};

// Bulk import students from CSV
exports.bulkImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: 'Please upload a CSV file!'
      });
    }

    const students = [];
    const errors = [];
    let rowCount = 0;

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        // Validate required fields
        if (!row.studentId || !row.name || !row.grade) {
          errors.push(`Row ${rowCount}: Missing required fields (studentId, name, grade)`);
          return;
        }
        
        students.push({
          studentId: row.studentId,
          name: row.name,
          dateOfBirth: row.dateOfBirth,
          gender: row.gender,
          grade: row.grade,
          section: row.section,
          parentName: row.parentName,
          contactNumber: row.contactNumber,
          address: row.address
        });
      })
      .on('end', async () => {
        // Remove the temporary file
        fs.unlinkSync(req.file.path);
        
        if (errors.length > 0) {
          return res.status(400).send({
            message: 'Validation errors in CSV file',
            errors: errors
          });
        }
        
        if (students.length === 0) {
          return res.status(400).send({
            message: 'No valid student records found in the CSV file'
          });
        }
        
        try {
          // Bulk create students
          await Student.bulkCreate(students, {
            validate: true,
            ignoreDuplicates: true
          });
          
          res.status(200).send({
            message: `${students.length} students were imported successfully!`
          });
        } catch (error) {
          res.status(500).send({
            message: error.message || 'Some error occurred while importing students.'
          });
        }
      });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while processing the file.'
    });
  }
};