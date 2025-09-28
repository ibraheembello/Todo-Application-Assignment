const logger = require('../utils/logger');

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    logger.info(`Authenticated request from user: ${req.session.user.username}`);
    return next();
  }
  
  logger.warn(`Unauthenticated access attempt to ${req.url}`);
  req.flash('error', 'Please log in to access this page');
  return res.redirect('/auth/login');
};

// Redirect authenticated users
const redirectIfAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    logger.info(`Authenticated user ${req.session.user.username} redirected from auth page`);
    return res.redirect('/todos');
  }
  next();
};

module.exports = {
  requireAuth,
  redirectIfAuth
};