const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('./db.config');

// Create a separate connection to postgres database to create our app database if it doesn't exist
const initializeDatabase = async () => {
  console.log('Checking database...');
  
  // First connect to the postgres database to be able to create our app database
  const adminSequelize = new Sequelize('postgres', config.USER, config.PASSWORD, {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: 0,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    logging: false
  });

  try {
    // Check connection
    await adminSequelize.authenticate();
    console.log('Connected to PostgreSQL server successfully.');

    // Check if our database exists
    const [results] = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${config.DB}'`
    );

    // If database doesn't exist, create it
    if (results.length === 0) {
      console.log(`Database '${config.DB}' not found, creating...`);
      await adminSequelize.query(`CREATE DATABASE "${config.DB}"`);
      console.log(`Database '${config.DB}' created successfully.`);
    } else {
      console.log(`Database '${config.DB}' already exists.`);
    }

    // Close admin connection
    await adminSequelize.close();

    // Now connect to our application database to run the schema
    const appSequelize = new Sequelize(
      config.DB,
      config.USER,
      config.PASSWORD,
      {
        host: config.HOST,
        dialect: config.dialect,
        operatorsAliases: 0,
        pool: {
          max: config.pool.max,
          min: config.pool.min,
          acquire: config.pool.acquire,
          idle: config.pool.idle
        },
        logging: false
      }
    );

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../db_setup.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .filter(statement => statement.trim() !== '')
      .map(statement => statement.trim() + ';');

    // Execute each statement
    console.log('Initializing database schema...');
    for (const statement of statements) {
      // Skip commented lines and CREATE DATABASE statement
      if (!statement.trim().startsWith('--') && !statement.includes('CREATE DATABASE')) {
        await appSequelize.query(statement);
      }
    }

    console.log('Database schema initialized successfully.');
    await appSequelize.close();
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

module.exports = { initializeDatabase };