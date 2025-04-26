module.exports = (sequelize, Sequelize) => {
  const VaccinationDrive = sequelize.define('vaccinationDrive', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    vaccineName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    availableDoses: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    applicableGrades: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  return VaccinationDrive;
};