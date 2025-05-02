const db = require('../models');
const Student = db.student;
const VaccinationDrive = db.vaccinationDrive;
const Vaccination = db.vaccination;
const sequelize = db.sequelize;
const { Op, Sequelize } = require('sequelize');

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get total number of students
    const totalStudents = await Student.count();
    
    // Get total number of vaccinated students (unique students who have received at least one vaccination)
    const vaccinatedStudentsCount = await Vaccination.count({
      distinct: true,
      col: 'studentId'
    });
    
    // Calculate vaccination percentage
    const vaccinationPercentage = totalStudents > 0 
      ? Math.round((vaccinatedStudentsCount / totalStudents) * 100) 
      : 0;
    
    // Get upcoming vaccination drives (next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    const upcomingDrives = await VaccinationDrive.findAll({
      where: {
        date: {
          [Op.between]: [today, thirtyDaysLater]
        },
        status: 'scheduled'
      },
      order: [['date', 'ASC']]
    });
    
    // Get vaccination counts by vaccine type
    // Using a simpler approach with raw SQL to avoid complex ORM issues
    const [vaccinationsByType] = await sequelize.query(`
      SELECT vd."vaccineName", COUNT(v.id) as count
      FROM "vaccinationDrives" vd
      LEFT JOIN vaccinations v ON vd.id = v."driveId"
      GROUP BY vd."vaccineName"
    `);
    
    // Get recent vaccination drives (last 5)
    const recentDrives = await VaccinationDrive.findAll({
      where: {
        date: {
          [Op.lte]: today
        }
      },
      order: [['date', 'DESC']],
      limit: 5,
      include: [{
        model: Vaccination,
        as: 'vaccinations',
        required: false
      }]
    });
    
    // Add vaccination count to each recent drive
    const recentDrivesWithCount = recentDrives.map(drive => {
      const plainDrive = drive.get({ plain: true });
      plainDrive.vaccinatedCount = plainDrive.vaccinations ? plainDrive.vaccinations.length : 0;
      delete plainDrive.vaccinations; // Remove the vaccinations array to reduce payload size
      return plainDrive;
    });
    
    // Format the response
    const response = {
      totalStudents,
      vaccinatedStudentsCount,
      vaccinationPercentage,
      upcomingDrives: upcomingDrives.map(drive => {
        const plainDrive = drive.get({ plain: true });
        return {
          id: plainDrive.id,
          name: plainDrive.name,
          vaccineName: plainDrive.vaccineName,
          date: plainDrive.date,
          status: plainDrive.status,
          availableDoses: plainDrive.availableDoses,
          applicableGrades: plainDrive.applicableGrades || []
        };
      }),
      vaccinationsByType: vaccinationsByType.map(type => ({
        vaccineName: type.vaccineName,
        count: parseInt(type.count || '0')
      })),
      recentDrives: recentDrivesWithCount
    };
    
    res.send(response);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving dashboard statistics.'
    });
  }
};

// Get recent vaccination drives
exports.getRecentDrives = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const today = new Date();
    
    // Get recent vaccination drives
    const recentDrives = await VaccinationDrive.findAll({
      where: {
        date: {
          [Op.lte]: today
        }
      },
      order: [['date', 'DESC']],
      limit: limit,
      include: [{
        model: Vaccination,
        as: 'vaccinations',
        required: false
      }]
    });
    
    // Add vaccination count to each drive
    const formattedDrives = recentDrives.map(drive => {
      const plainDrive = drive.get({ plain: true });
      return {
        id: plainDrive.id,
        name: plainDrive.name,
        vaccineName: plainDrive.vaccineName,
        date: plainDrive.date,
        status: plainDrive.status,
        vaccinatedCount: plainDrive.vaccinations ? plainDrive.vaccinations.length : 0,
        availableDoses: plainDrive.availableDoses || 0
      };
    });
    
    res.send(formattedDrives);
  } catch (error) {
    console.error('Error in getRecentDrives:', error);
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving recent drives.'
    });
  }
};

// Get upcoming vaccination drives
exports.getUpcomingDrives = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const today = new Date();
    
    // Get upcoming vaccination drives
    const upcomingDrives = await VaccinationDrive.findAll({
      where: {
        date: {
          [Op.gt]: today
        },
        status: 'scheduled'
      },
      order: [['date', 'ASC']],
      limit: limit,
      include: [{
        model: Vaccination,
        as: 'vaccinations',
        required: false
      }]
    });
    
    // Format the response
    const formattedDrives = upcomingDrives.map(drive => {
      const plainDrive = drive.get({ plain: true });
      const result = {
        id: plainDrive.id,
        name: plainDrive.name,
        vaccineName: plainDrive.vaccineName,
        date: plainDrive.date,
        status: plainDrive.status,
        availableDoses: plainDrive.availableDoses,
        applicableGrades: plainDrive.applicableGrades || [],
        description: plainDrive.description,
        vaccinatedCount: plainDrive.vaccinations ? plainDrive.vaccinations.length : 0
      };
      
      // Remove the vaccinations array to reduce payload size
      delete result.vaccinations;
      
      return result;
    });
    
    res.send(formattedDrives);
  } catch (error) {
    console.error('Error in getUpcomingDrives:', error);
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving upcoming drives.'
    });
  }
};