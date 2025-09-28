const User = require('../models/User');
const logger = require('../utils/logger');
const Joi = require('joi');

// Validation schemas
const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

class AuthController {
  // Render signup page
  static getSignup = (req, res) => {
    res.render('auth/signup', {
      title: 'Sign Up'
    });
  };

  // Handle user registration
  static postSignup = async (req, res) => {
    try {
      // Validate input
      const { error, value } = signupSchema.validate(req.body);
      if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/auth/signup');
      }

      const { username, password } = value;

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        req.flash('error', 'Username already exists');
        return res.redirect('/auth/signup');
      }

      // Create new user
      const user = new User({ username, password });
      await user.save();

      logger.info(`New user registered: ${username}`);
      req.flash('success', 'Registration successful! Please log in.');
      res.redirect('/auth/login');

    } catch (error) {
      logger.error('Signup error:', error);
      req.flash('error', 'Registration failed. Please try again.');
      res.redirect('/auth/signup');
    }
  };

  // Render login page
  static getLogin = (req, res) => {
    res.render('auth/login', {
      title: 'Login'
    });
  };

  // Handle user login
  static postLogin = async (req, res) => {
    try {
      // Validate input
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/auth/login');
      }

      const { username, password } = value;

      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/auth/login');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/auth/login');
      }

      // Create session
      req.session.user = {
        id: user._id,
        username: user.username
      };

      logger.info(`User logged in: ${username}`);
      req.flash('success', `Welcome back, ${username}!`);
      res.redirect('/todos');

    } catch (error) {
      logger.error('Login error:', error);
      req.flash('error', 'Login failed. Please try again.');
      res.redirect('/auth/login');
    }
  };

  // Handle user logout
  static logout = (req, res) => {
    const username = req.session.user?.username;
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Logout error:', err);
        req.flash('error', 'Logout failed');
        return res.redirect('/todos');
      }

      logger.info(`User logged out: ${username}`);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  };
}

module.exports = AuthController;