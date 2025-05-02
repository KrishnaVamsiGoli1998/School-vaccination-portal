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

// Get vaccination statistics
exports.getStatistics = async (req, res) => {
  try {
    // Get total students
    const totalStudents = await Student.count();
    
    // Get total vaccinated students (unique)
    const vaccinatedStudentsCount = await Vaccination.count({
      distinct: true,
      col: 'studentId'
    });
    
    // Get vaccination by vaccine type using raw SQL
    const sequelize = db.sequelize;
    const [vaccineTypes] = await sequelize.query(`
      SELECT vd."vaccineName", COUNT(v.id) as count
      FROM "vaccinationDrives" vd
      LEFT JOIN vaccinations v ON vd.id = v."driveId"
      GROUP BY vd."vaccineName"
    `);
    
    // Calculate vaccination rate
    const vaccinationRate = totalStudents > 0 
      ? Math.round((vaccinatedStudentsCount / totalStudents) * 100) 
      : 0;
    
    res.send({
      totalStudents,
      vaccinatedStudents: vaccinatedStudentsCount,
      vaccinationRate,
      vaccineTypes: vaccineTypes.map(type => ({
        name: type.vaccineName,
        count: parseInt(type.count || '0')
      }))
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving statistics.'
    });
  }
};

// Export vaccination data as CSV
exports.exportData = async (req, res) => {
  try {
    // Get all vaccinations with related data
    const vaccinations = await Vaccination.findAll({
      include: [
        {
          model: Student,
          as: 'student'
        },
        {
          model: VaccinationDrive,
          as: 'drive'
        }
      ]
    });
    
    // Format the data for CSV
    const formattedData = vaccinations.map(vaccination => {
      const plainVaccination = vaccination.get({ plain: true });
      return {
        'Student ID': plainVaccination.student.studentId,
        'Student Name': plainVaccination.student.name,
        'Grade': plainVaccination.student.grade,
        'Section': plainVaccination.student.section,
        'Vaccine Name': plainVaccination.drive.vaccineName,
        'Vaccination Date': new Date(plainVaccination.date).toLocaleDateString(),
        'Drive Name': plainVaccination.drive.name,
        'Drive Date': new Date(plainVaccination.drive.date).toLocaleDateString(),
        'Administered By': plainVaccination.administeredBy
      };
    });
    
    // Convert to CSV
    const fields = [
      'Student ID', 'Student Name', 'Grade', 'Section', 
      'Vaccine Name', 'Vaccination Date', 'Drive Name', 'Drive Date', 'Administered By'
    ];
    
    const json2csvParser = new json2csv({ fields });
    const csv = json2csvParser.parse(formattedData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vaccination_data.csv');
    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while exporting data.'
    });
  }
};