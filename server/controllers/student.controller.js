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

// Helper function to format date
const formatDateForDB = (dateString) => {
  // Check if it matches DD-MM-YYYY format
  const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (ddmmyyyyPattern.test(dateString)) {
    const matches = dateString.match(ddmmyyyyPattern);
    const day = matches[1];
    const month = matches[2];
    const year = matches[3];
    
    // Validate the date components
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (monthNum < 1 || monthNum > 12) {
      return { error: `Invalid month: ${month}. Month must be between 01 and 12.` };
    }
    
    // Check days per month (simplified)
    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Adjust for leap year
    if (yearNum % 400 === 0 || (yearNum % 100 !== 0 && yearNum % 4 === 0)) {
      daysInMonth[2] = 29;
    }
    
    if (dayNum < 1 || dayNum > daysInMonth[monthNum]) {
      return { error: `Invalid day: ${day}. Day must be between 01 and ${daysInMonth[monthNum]} for month ${month}.` };
    }
    
    // Return the formatted date in YYYY-MM-DD format
    return { value: `${year}-${month}-${day}` };
  }
  
  return { error: 'Date must be in DD-MM-YYYY format with hyphens (e.g., 21-07-1998).' };
};

// Bulk import students from CSV
exports.bulkImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: 'Please upload a CSV file!'
      });
    }

    // Check file content
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    
    // Check if the file has proper CSV format with commas
    if (!fileContent.includes(',')) {
      // Try to detect if this is a CSV without proper delimiters
      const firstLine = fileContent.split('\n')[0];
      
      if (firstLine && firstLine.includes('studentId') && !firstLine.includes(',')) {
        fs.unlinkSync(req.file.path);
        return res.status(400).send({
          message: 'Invalid CSV format. Your file appears to be missing comma separators between fields. Please ensure your CSV file has proper comma-separated values.',
          example: 'studentId,name,dateOfBirth,gender,grade,section,parentName,contactNumber,address'
        });
      }
    }

    const students = [];
    const errors = [];
    let rowCount = 0;
    let headerValidated = false;

    fs.createReadStream(req.file.path)
      .pipe(csv({
        // Add more options to make CSV parsing more robust
        skipLines: 0,
        strict: true,
        trim: true
      }))
      .on('headers', (headers) => {
        // Validate headers
        const requiredHeaders = ['studentId', 'name', 'grade'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          errors.push(`CSV headers missing required fields: ${missingHeaders.join(', ')}`);
        }
        
        headerValidated = true;
      })
      .on('data', (row) => {
        rowCount++;
        
        // Log the row for debugging
        console.log(`Processing row ${rowCount}:`, JSON.stringify(row));
        
        // Validate required fields
        if (!row.studentId || !row.name || !row.grade) {
          errors.push(`Row ${rowCount}: Missing required fields (studentId, name, grade)`);
          return;
        }
        
        // Process date of birth if present
        let dateOfBirth = null;
        if (row.dateOfBirth && row.dateOfBirth.trim() !== '') {
          const dateResult = formatDateForDB(row.dateOfBirth.trim());
          if (dateResult.error) {
            errors.push(`Row ${rowCount}: ${dateResult.error}`);
            return;
          }
          dateOfBirth = dateResult.value;
          console.log(`Converted date from ${row.dateOfBirth} to ${dateOfBirth}`);
        }
        
        // Validate gender if present
        if (row.gender && !['Male', 'Female', 'Other'].includes(row.gender)) {
          errors.push(`Row ${rowCount}: Invalid gender value. Use 'Male', 'Female', or 'Other'.`);
          return;
        }
        
        // Create student object with properly formatted data
        const student = {
          studentId: row.studentId.trim(),
          name: row.name.trim(),
          grade: row.grade.trim(),
          gender: row.gender ? row.gender.trim() : null,
          section: row.section ? row.section.trim() : null,
          parentName: row.parentName ? row.parentName.trim() : null,
          contactNumber: row.contactNumber ? row.contactNumber.trim() : null,
          address: row.address ? row.address.trim() : null
        };
        
        // Only add dateOfBirth if it's valid
        if (dateOfBirth) {
          student.dateOfBirth = dateOfBirth;
        }
        
        students.push(student);
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        errors.push(`CSV parsing error: ${error.message}`);
      })
      .on('end', async () => {
        // Remove the temporary file
        fs.unlinkSync(req.file.path);
        
        if (!headerValidated) {
          return res.status(400).send({
            message: 'CSV file format error. Could not parse headers.',
            example: 'studentId,name,dateOfBirth,gender,grade,section,parentName,contactNumber,address'
          });
        }
        
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
          // Log what we're trying to insert for debugging
          console.log('Attempting to insert students:', JSON.stringify(students, null, 2));
          
          // Insert students one by one to better handle errors
          const results = [];
          const failedRows = [];
          
          for (let i = 0; i < students.length; i++) {
            try {
              const student = students[i];
              const result = await Student.create(student);
              results.push(result);
            } catch (error) {
              console.error(`Error inserting row ${i+1}:`, error.message);
              failedRows.push({
                rowNumber: i+1,
                student: students[i],
                error: error.message
              });
            }
          }
          
          if (failedRows.length > 0) {
            return res.status(207).send({
              message: `Imported ${results.length} out of ${students.length} students. ${failedRows.length} rows failed.`,
              failedRows: failedRows.map(row => ({
                rowNumber: row.rowNumber,
                studentId: row.student.studentId,
                error: row.error
              }))
            });
          }
          
          res.status(200).send({
            message: `${results.length} students were imported successfully!`
          });
        } catch (error) {
          console.error('Error during bulk create:', error);
          
          // Provide more specific error messages based on the error
          let errorMessage = error.message || 'Some error occurred while importing students.';
          
          // Check for common error patterns and provide more helpful messages
          if (errorMessage.includes('date/time field value out of range') || 
              errorMessage.includes('invalid input syntax for type date')) {
            errorMessage = 'Invalid date format. Please ensure all dates are in DD-MM-YYYY format (e.g., 21-07-1998) and are valid dates.';
          }
          
          res.status(500).send({
            message: errorMessage
          });
        }
      });
  } catch (error) {
    console.error('Error in bulkImport:', error);
    
    // Try to clean up the file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    
    res.status(500).send({
      message: error.message || 'Some error occurred while processing the file.'
    });
  }
};