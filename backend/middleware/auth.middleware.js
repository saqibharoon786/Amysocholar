// auth.middleware.js - FIXED VERSION
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const JWT_SECRET = process.env.JWT_SECRET

// Fix: Import AppError correctly
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
console.log("Token:", token);
    if (!token) {
      return next(new AppError('Please log in to access this resource', 401));
    }

    // Fix: Replace config.jwt.secret with process.env.JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password was recently changed. Please log in again.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid token', 401));
  }
};

// Check if user is superadmin
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }
  return next(new AppError('Super admin access required', 403));
};

// Check if user is admin or superadmin
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  return next(new AppError('Admin access required', 403));
};

// Check if user is customer
const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    return next();
  }
  return next(new AppError('Customer access required', 403));
};

module.exports = {
  protect,
  isSuperAdmin,
  isAdmin,
  isCustomer,
};