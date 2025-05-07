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
    const { upcoming, past, status, t } = req.query; // t is timestamp for cache busting
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

    // Force a database sync to ensure we get the latest data
    await db.sequelize.query('SELECT 1+1 as result');

    // Get all drives with their vaccinations
    const drives = await VaccinationDrive.findAll({
      where: condition,
      include: [{
        model: Vaccination,
        as: 'vaccinations'
      }],
      order: [['date', 'ASC']]
    });



    // Process each drive to get accurate vaccination counts
    const drivesWithCount = await Promise.all(drives.map(async (drive) => {
      const plainDrive = drive.get({ plain: true });
      
      // Get the actual count from the database to ensure accuracy
      const vaccinationCount = await Vaccination.count({
        where: { driveId: drive.id }
      });
      
      plainDrive.vaccinatedCount = vaccinationCount;
      
      // Remove the vaccinations array to reduce payload size
      delete plainDrive.vaccinations;
      
      return plainDrive;
    }));

    // Set cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    res.send(drivesWithCount);
  } catch (error) {
    console.error('Error retrieving vaccination drives:', error);
    res.status(500).send({
      message: error.message || 'Some error occurred while retrieving vaccination drives.'
    });
  }
};

// Find a single vaccination drive by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    // First, get the basic drive data
    const drive = await VaccinationDrive.findByPk(id);
    
    if (!drive) {
      return res.status(404).send({
        message: `Vaccination drive with id ${id} not found.`
      });
    }
    
    // Get all vaccinations for this drive with student data
    const vaccinations = await Vaccination.findAll({
      where: { driveId: id },
      include: [{
        model: Student,
        as: 'student'
      }]
    });
    

    
    // Create a response object with all the data needed
    const plainDrive = drive.get({ plain: true });
    plainDrive.vaccinations = vaccinations.map(v => v.get({ plain: true }));
    plainDrive.vaccinatedCount = vaccinations.length;
    

    
    // Set cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.send(plainDrive);
  } catch (error) {
    console.error('Error retrieving drive:', error);
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
    
    // Check if the drive is in the future (more than 1 day ahead)
    const driveDate = new Date(drive.date);
    const today = new Date();
    
    // Allow recording on the day of the drive or past drives
    // Add 1 day buffer to account for timezone differences
    const oneDayAhead = new Date(today);
    oneDayAhead.setDate(today.getDate() + 1);
    
    if (driveDate > oneDayAhead) {
      return res.status(400).send({
        message: 'Cannot record vaccinations for future drives! You can only record vaccinations on or after the drive date.'
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
    
    // Create vaccinations one by one to ensure they're properly created
    const createdVaccinations = [];
    for (const vaccination of vaccinations) {
      try {
        const created = await Vaccination.create(vaccination);
        createdVaccinations.push(created);
      } catch (error) {
        console.error(`Error creating vaccination for student ${vaccination.studentId}:`, error);
        throw error;
      }
    }
    
    // Calculate new available doses count
    const newAvailableDoses = drive.availableDoses - studentIds.length;
    

    
    // Update drive with new available doses count and status if needed
    if (newAvailableDoses <= 0) {
      // If no doses left, mark as completed
      await VaccinationDrive.update(
        { 
          status: 'completed',
          availableDoses: 0 // Ensure it doesn't go negative
        },
        { 
          where: { id: driveId },
          returning: true // Get the updated record
        }
      );

    } else {
      // Otherwise just update the available doses
      await VaccinationDrive.update(
        { availableDoses: newAvailableDoses },
        { 
          where: { id: driveId },
          returning: true // Get the updated record
        }
      );

    }
    
    // Force a database sync to ensure changes are committed
    await db.sequelize.sync();
    
    // Force a fresh query to get the most up-to-date data
    await db.sequelize.query('SELECT 1+1 as result');
    
    // Get the updated drive data to send back with no caching
    const updatedDrive = await VaccinationDrive.findByPk(driveId, {
      include: [{
        model: Vaccination,
        as: 'vaccinations',
        include: [{
          model: Student,
          as: 'student'
        }]
      }],
      // Use a new transaction to ensure we get the latest data
      transaction: null
    });
    
    const plainUpdatedDrive = updatedDrive.get({ plain: true });
    plainUpdatedDrive.vaccinatedCount = plainUpdatedDrive.vaccinations ? plainUpdatedDrive.vaccinations.length : 0;
    
    console.log(`Drive ${driveId} updated data:`, {
      availableDoses: plainUpdatedDrive.availableDoses,
      vaccinatedCount: plainUpdatedDrive.vaccinatedCount,
      totalVaccinations: plainUpdatedDrive.vaccinations ? plainUpdatedDrive.vaccinations.length : 0,
      vaccinationIds: plainUpdatedDrive.vaccinations ? plainUpdatedDrive.vaccinations.map(v => v.id) : []
    });
    
    // Log the first vaccination for debugging
    if (plainUpdatedDrive.vaccinations && plainUpdatedDrive.vaccinations.length > 0) {
      console.log('First vaccination:', {
        id: plainUpdatedDrive.vaccinations[0].id,
        studentId: plainUpdatedDrive.vaccinations[0].studentId,
        student: plainUpdatedDrive.vaccinations[0].student ? {
          id: plainUpdatedDrive.vaccinations[0].student.id,
          name: plainUpdatedDrive.vaccinations[0].student.name
        } : 'No student data'
      });
    } else {
      console.log('No vaccinations found in the updated drive data');
    }
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    res.status(201).send({
      message: `${studentIds.length} vaccinations recorded successfully!`,
      drive: plainUpdatedDrive
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Some error occurred while recording vaccinations.'
    });
  }
};