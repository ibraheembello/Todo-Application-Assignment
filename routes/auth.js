const express = require('express');
const AuthController = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/auth');

const router = express.Router();

// Signup routes
router.get('/signup', redirectIfAuth, AuthController.getSignup);
router.post('/signup', redirectIfAuth, AuthController.postSignup);

// Login routes
router.get('/login', redirectIfAuth, AuthController.getLogin);
router.post('/login', redirectIfAuth, AuthController.postLogin);

// Logout route
router.post('/logout', AuthController.logout);

module.exports = router;