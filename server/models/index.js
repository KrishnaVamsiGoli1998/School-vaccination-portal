const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config.js');

// Create Sequelize instance with retry logic
const createSequelizeInstance = () => {
  const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    retry: {
      max: 5,
      timeout: 3000
    }
  });
  
  return sequelize;
};

const sequelize = createSequelizeInstance();

// Initialize db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model.js')(sequelize, Sequelize);
db.student = require('./student.model.js')(sequelize, Sequelize);
db.vaccinationDrive = require('./vaccinationDrive.model.js')(sequelize, Sequelize);
db.vaccination = require('./vaccination.model.js')(sequelize, Sequelize);

// Define relationships
db.vaccinationDrive.hasMany(db.vaccination, { as: 'vaccinations' });
db.vaccination.belongsTo(db.vaccinationDrive, {
  foreignKey: 'driveId',
  as: 'drive'
});

db.student.hasMany(db.vaccination, { as: 'vaccinations' });
db.vaccination.belongsTo(db.student, {
  foreignKey: 'studentId',
  as: 'student'
});

module.exports = db;