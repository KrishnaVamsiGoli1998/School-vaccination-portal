const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

// Verify JWT token
const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  // Remove Bearer prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!'
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// Check if user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.role === 'admin') {
      next();
      return;
    }

    res.status(403).send({
      message: 'Require Admin Role!'
    });
  } catch (error) {
    res.status(500).send({
      message: 'Unable to validate user role!'
    });
  }
};

// Check if user is a coordinator
const isCoordinator = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user.role === 'coordinator' || user.role === 'admin') {
      next();
      return;
    }

    res.status(403).send({
      message: 'Require Coordinator Role!'
    });
  } catch (error) {
    res.status(500).send({
      message: 'Unable to validate user role!'
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isCoordinator
};

module.exports = authJwt;