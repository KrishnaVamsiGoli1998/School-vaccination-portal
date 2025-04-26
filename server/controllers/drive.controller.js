const db = require('../models');
const VaccinationDrive = db.vaccinationDrive;
const Vaccination = db.vaccination;
const Student = db.student;
const { Op } = require('sequelize');

// Create a new vaccination drive
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.vaccineName || !req.body.date || !req.body.availableDoses || !req.body.applicableGrades) {
      return res.status(400).send({
        message: 'All fields are required!'
      });
    }

    // Check if the date is at least 15 days in the future
    const driveDate = new Date(req.body.date);
    const today = new Date();
    const timeDiff = driveDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff < 15) {
      return res.status(400).send({
        message: 'Vaccination drives must be scheduled at least 15 days in advance!'
      });
    }

    // Check for overlapping drives on the same date
    const existingDrive = await VaccinationDrive.findOne({
      where: {
        date: req.body.date
      }
    });

    if (existingDrive) {
      return res.status(400).send({
        message: 'A vaccination drive is already scheduled for this date!'
      });
    }

    // Create a new vaccination drive
    const drive = await VaccinationDrive.create({
      name: req.body.name,
      vaccineName: req.body.vaccineName,
      date: req.body.date,
      availableDoses: req.body.availableDoses,
      applicableGrades: req.body.applicableGrades,
      description: req.body.description,
      status: 'scheduled'
    });

    res.status(201).send(drive);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while creating the vaccination drive.'
    });
  }
};

// Retrieve all vaccination drives
exports.findAll = async (req, res) => {
  try {
    const { upcoming, past, status } = req.query;
    let condition = {};
    
    // Filter by status if provided
    if (status) {
      condition.status = status;
    }
    
    // Filter for upcoming drives (next 30 days)
    if (upcoming === 'true') {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      condition.date = {
        [Op.between]: [today, thirtyDaysLater]
      };
      condition.status = 'scheduled';
    }
    
    // Filter for past drives
    if (past === 'true') {
      const today = new Date();
      condition.date = {
        [Op.lt]: today
      };
    }

    const drives = await VaccinationDrive.findAll({
      where: condition,
      include: [{
        model: Vaccination,
        as: 'vaccinations'
      }],
      order: [['date', 'ASC']]
    });

    // Add vaccination count to each drive
    const drivesWithCount = drives.map(drive => {
      const plainDrive = drive.get({ plain: true });
      plainDrive.vaccinatedCount = plainDrive.vaccinations ? plainDrive.vaccinations.length : 0;
      return plainDrive;
    });

    res.send(drivesWithCount);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving vaccination drives.'
    });
  }
};

// Find a single vaccination drive by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const drive = await VaccinationDrive.findByPk(id, {
      include: [{
        model: Vaccination,
        as: 'vaccinations',
        include: [{
          model: Student,
          as: 'student'
        }]
      }]
    });
    
    if (!drive) {
      return res.status(404).send({
        message: `Vaccination drive with id ${id} not found.`
      });
    }
    
    // Add vaccination count
    const plainDrive = drive.get({ plain: true });
    plainDrive.vaccinatedCount = plainDrive.vaccinations ? plainDrive.vaccinations.length : 0;
    
    res.send(plainDrive);
  } catch (error) {
    res.status(500).send({
      message: `Error retrieving vaccination drive with id ${req.params.id}`
    });
  }
};

// Update a vaccination drive
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get the drive first to check if it's in the past
    const drive = await VaccinationDrive.findByPk(id);
    
    if (!drive) {
      return res.status(404).send({
        message: `Vaccination drive with id ${id} not found.`
      });
    }
    
    // Check if the drive is in the past
    const driveDate = new Date(drive.date);
    const today = new Date();
    
    if (driveDate < today) {
      return res.status(400).send({
        message: 'Cannot update past vaccination drives!'
      });
    }
    
    // If updating the date, check if it's at least 15 days in the future
    if (req.body.date) {
      const newDriveDate = new Date(req.body.date);
      const timeDiff = newDriveDate.getTime() - today.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff < 15) {
        return res.status(400).send({
          message: 'Vaccination drives must be scheduled at least 15 days in advance!'
        });
      }
      
      // Check for overlapping drives on the new date
      const existingDrive = await VaccinationDrive.findOne({
        where: {
          date: req.body.date,
          id: { [Op.ne]: id }
        }
      });

      if (existingDrive) {
        return res.status(400).send({
          message: 'A vaccination drive is already scheduled for this date!'
        });
      }
    }
    
    // Update the drive
    const [num] = await VaccinationDrive.update(req.body, {
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: 'Vaccination drive was updated successfully.'
      });
    } else {
      res.send({
        message: `Cannot update vaccination drive with id=${id}. Maybe vaccination drive was not found or req.body is empty!`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Error updating vaccination drive with id=${req.params.id}`
    });
  }
};

// Delete a vaccination drive
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Get the drive first to check if it's in the past
    const drive = await VaccinationDrive.findByPk(id);
    
    if (!drive) {
      return res.status(404).send({
        message: `Vaccination drive with id ${id} not found.`
      });
    }
    
    // Check if the drive is in the past
    const driveDate = new Date(drive.date);
    const today = new Date();
    
    if (driveDate < today) {
      return res.status(400).send({
        message: 'Cannot delete past vaccination drives!'
      });
    }
    
    // Check if there are any vaccinations for this drive
    const vaccinationCount = await Vaccination.count({
      where: { driveId: id }
    });
    
    if (vaccinationCount > 0) {
      return res.status(400).send({
        message: 'Cannot delete a vaccination drive with recorded vaccinations!'
      });
    }
    
    // Delete the drive
    const num = await VaccinationDrive.destroy({
      where: { id: id }
    });
    
    if (num === 1) {
      res.send({
        message: 'Vaccination drive was deleted successfully!'
      });
    } else {
      res.send({
        message: `Cannot delete vaccination drive with id=${id}. Maybe vaccination drive was not found!`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Could not delete vaccination drive with id=${req.params.id}`
    });
  }
};

// Record vaccinations for students in a drive
exports.recordVaccinations = async (req, res) => {
  try {
    const driveId = req.params.id;
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).send({
        message: 'Please provide an array of student IDs!'
      });
    }
    
    // Get the drive
    const drive = await VaccinationDrive.findByPk(driveId);
    
    if (!drive) {
      return res.status(404).send({
        message: `Vaccination drive with id ${driveId} not found.`
      });
    }
    
    // Check if the drive is in the past
    const driveDate = new Date(drive.date);
    const today = new Date();
    
    if (driveDate > today) {
      return res.status(400).send({
        message: 'Cannot record vaccinations for future drives!'
      });
    }
    
    // Check if there are enough doses available
    const existingVaccinationsCount = await Vaccination.count({
      where: { driveId }
    });
    
    const remainingDoses = drive.availableDoses - existingVaccinationsCount;
    
    if (remainingDoses < studentIds.length) {
      return res.status(400).send({
        message: `Not enough doses available! Only ${remainingDoses} doses remaining.`
      });
    }
    
    // Check if any students are already vaccinated in this drive
    const existingVaccinations = await Vaccination.findAll({
      where: {
        driveId,
        studentId: { [Op.in]: studentIds }
      }
    });
    
    if (existingVaccinations.length > 0) {
      const alreadyVaccinatedIds = existingVaccinations.map(v => v.studentId);
      return res.status(400).send({
        message: 'Some students are already vaccinated in this drive!',
        alreadyVaccinatedIds
      });
    }
    
    // Record vaccinations
    const vaccinations = studentIds.map(studentId => ({
      studentId,
      driveId,
      date: today,
      administeredBy: req.body.administeredBy || 'School Coordinator'
    }));
    
    await Vaccination.bulkCreate(vaccinations);
    
    // Update drive status if all doses are used
    if (existingVaccinationsCount + studentIds.length >= drive.availableDoses) {
      await VaccinationDrive.update(
        { status: 'completed' },
        { where: { id: driveId } }
      );
    }
    
    res.status(201).send({
      message: `${studentIds.length} vaccinations recorded successfully!`
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while recording vaccinations.'
    });
  }
};