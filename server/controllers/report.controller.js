const db = require('../models');
const Student = db.student;
const VaccinationDrive = db.vaccinationDrive;
const Vaccination = db.vaccination;
const { Op } = require('sequelize');
const json2csv = require('json2csv').Parser;

// Generate vaccination report
exports.generateReport = async (req, res) => {
  try {
    const { driveId, vaccineName, startDate, endDate, grade, status } = req.query;
    
    // Build the query conditions
    let condition = {};
    let driveCondition = {};
    let studentCondition = {};
    
    if (driveId) {
      condition.driveId = driveId;
    }
    
    if (vaccineName) {
      driveCondition.vaccineName = vaccineName;
    }
    
    if (startDate && endDate) {
      driveCondition.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      driveCondition.date = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      driveCondition.date = {
        [Op.lte]: endDate
      };
    }
    
    if (grade) {
      studentCondition.grade = grade;
    }
    
    // Get vaccinations with related data
    const vaccinations = await Vaccination.findAll({
      where: condition,
      include: [
        {
          model: Student,
          as: 'student',
          where: studentCondition,
          required: true
        },
        {
          model: VaccinationDrive,
          as: 'drive',
          where: driveCondition,
          required: true
        }
      ],
      order: [['date', 'DESC']]
    });
    
    // If status filter is applied, filter the results
    let filteredVaccinations = vaccinations;
    if (status === 'vaccinated' && driveId) {
      filteredVaccinations = vaccinations.filter(v => v.driveId.toString() === driveId);
    }
    
    // Format the data for response
    const formattedData = filteredVaccinations.map(vaccination => {
      const plainVaccination = vaccination.get({ plain: true });
      return {
        studentId: plainVaccination.student.studentId,
        studentName: plainVaccination.student.name,
        grade: plainVaccination.student.grade,
        section: plainVaccination.student.section,
        vaccineName: plainVaccination.drive.vaccineName,
        vaccinationDate: plainVaccination.date,
        driveName: plainVaccination.drive.name,
        driveDate: plainVaccination.drive.date,
        administeredBy: plainVaccination.administeredBy
      };
    });
    
    // Check if CSV format is requested
    const format = req.query.format || 'json';
    
    if (format === 'csv') {
      // Convert to CSV
      const fields = [
        'studentId', 'studentName', 'grade', 'section', 
        'vaccineName', 'vaccinationDate', 'driveName', 'driveDate', 'administeredBy'
      ];
      
      const json2csvParser = new json2csv({ fields });
      const csv = json2csvParser.parse(formattedData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vaccination_report.csv');
      return res.status(200).send(csv);
    }
    
    // Return JSON response with pagination info
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedData = formattedData.slice(startIndex, endIndex);
    
    res.send({
      totalItems: formattedData.length,
      totalPages: Math.ceil(formattedData.length / limit),
      currentPage: page,
      data: paginatedData
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while generating the report.'
    });
  }
};