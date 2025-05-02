const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;

// Register a new user
exports.register = async (req, res) => {
  try {
    // Create a new user
    const user = await User.create({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
      name: req.body.name,
      role: req.body.role || 'coordinator'
    });

    res.status(201).send({ 
      message: 'User registered successfully!',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Find user by username
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // Validate password
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        message: 'Invalid Password!'
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    // Send response
    res.status(200).send({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// For demo purposes - hardcoded login
exports.demoLogin = (req, res) => {
  console.log('Demo login attempt:', req.body);
  
  // Hardcoded admin credentials for demo
  if (req.body.username === 'admin' && req.body.password === 'Vax@Portal2025!') {
    console.log('Demo login successful');
    
    // Use a fixed secret if environment variable is not set
    const jwtSecret = process.env.JWT_SECRET || 'vaccination-portal-secret-key';
    
    const token = jwt.sign({ id: 1 }, jwtSecret, {
      expiresIn: 86400 // 24 hours
    });

    // Send response with accessToken
    const response = {
      id: 1,
      username: 'admin',
      name: 'School Coordinator',
      role: 'coordinator',
      accessToken: token
    };
    
    console.log('Sending login response:', response);
    res.status(200).send(response);
  } else {
    console.log('Demo login failed: Invalid credentials');
    res.status(401).send({
      message: 'Invalid credentials!'
    });
  }
};