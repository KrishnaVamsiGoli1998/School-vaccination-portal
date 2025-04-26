module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define('student', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: false
    },
    grade: {
      type: Sequelize.STRING,
      allowNull: false
    },
    section: {
      type: Sequelize.STRING,
      allowNull: false
    },
    parentName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    contactNumber: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  return Student;
};