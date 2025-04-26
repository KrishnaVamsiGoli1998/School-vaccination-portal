const db = require('../models');
const Student = db.student;
const VaccinationDrive = db.vaccinationDrive;
const Vaccination = db.vaccination;
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
    const vaccinationsByType = await Vaccination.findAll({
      attributes: [
        [Sequelize.literal('drive.vaccineName'), 'vaccineName'],
        [Sequelize.fn('COUNT', Sequelize.col('vaccination.id')), 'count']
      ],
      include: [{
        model: VaccinationDrive,
        as: 'drive',
        attributes: []
      }],
      group: ['drive.vaccineName'],
      raw: true
    });
    
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
        as: 'vaccinations'
      }]
    });
    
    // Add vaccination count to each recent drive
    const recentDrivesWithCount = recentDrives.map(drive => {
      const plainDrive = drive.get({ plain: true });
      plainDrive.vaccinatedCount = plainDrive.vaccinations ? plainDrive.vaccinations.length : 0;
      delete plainDrive.vaccinations; // Remove the vaccinations array to reduce payload size
      return plainDrive;
    });
    
    res.send({
      totalStudents,
      vaccinatedStudentsCount,
      vaccinationPercentage,
      upcomingDrives,
      vaccinationsByType,
      recentDrives: recentDrivesWithCount
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving dashboard statistics.'
    });
  }
};