const logger = require('../utils/logger');

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  logger.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.session?.user?.id
  });

  // Default error
  let error = {
    message: 'Something went wrong',
    status: 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    error.status = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    error.status = 400;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    error.status = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }

  // Development vs Production error response
  if (process.env.NODE_ENV === 'development') {
    res.status(error.status).render('error', {
      title: 'Error',
      message: error.message,
      error: err,
      status: error.status
    });
  } else {
    res.status(error.status).render('error', {
      title: 'Error',
      message: error.status === 500 ? 'Something went wrong' : error.message,
      error: {},
      status: error.status
    });
  }
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  logger.warn(`404 - Page not found: ${req.url}`);
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist',
    error: {},
    status: 404
  });
};

module.exports = {
  globalErrorHandler,
  notFoundHandler
};