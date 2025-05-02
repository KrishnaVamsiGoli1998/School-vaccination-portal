const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const { initializeDatabase } = require('./config/db-init');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const driveRoutes = require('./routes/drive.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const docsRoutes = require('./routes/docs.routes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/docs', docsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to School Vaccination Portal API',
    documentation: '/api/docs'
  });
});

// API Documentation route
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// Set port and start server
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  // Uploads directory created
}

// Initialize database and start server
const startServer = async () => {
  try {
    // First initialize the database (create if not exists and run schema)
    const dbInitialized = await initializeDatabase();
    
    // Even if database initialization fails, try to continue
    // as the tables might already exist
    
    try {
      // Then sync Sequelize models
      await sequelize.sync({ alter: true });
      // Database synchronized successfully
    } catch (syncError) {
      console.error('Error syncing database models:', syncError.message);
      // Continue anyway to try to start the server
    }
    
    // Start the server
    app.listen(PORT, () => {
      // Server is running on port ${PORT}
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();