const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    
    // Log headers for debugging (without exposing sensitive data)
    console.log('Auth headers present:', {
      'x-access-token': !!req.headers['x-access-token'],
      'authorization': !!req.headers['authorization']
    });
    
    if (!token) {
      console.warn('No token provided in request');
      return res.status(403).send({
        message: 'No token provided!'
      });
    }

    // Remove Bearer prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    // Check if JWT_SECRET is properly set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).send({
        message: 'Server configuration error'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return res.status(401).send({
          message: 'Unauthorized: ' + err.message
        });
      }
      
      if (!decoded || !decoded.id) {
        console.error('Invalid token payload - missing user ID');
        return res.status(401).send({
          message: 'Invalid token payload'
        });
      }
      
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error('Unexpected error in token verification:', error);
    return res.status(500).send({
      message: 'Internal server error during authentication'
    });
  }
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