module.exports = (sequelize, Sequelize) => {
  const Vaccination = sequelize.define('vaccination', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    driveId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'vaccinationDrives',
        key: 'id'
      }
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    administeredBy: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });

  return Vaccination;
};