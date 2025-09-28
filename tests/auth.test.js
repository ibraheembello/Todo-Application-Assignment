const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  // Setup test database connection
  beforeAll(async () => {
    const url = process.env.MONGODB_URI || 'mongodb+srv://todoapp-user:U09ZDNSr1JEelzya@cluster3.6behnbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster3';
    await mongoose.connect(url);
  });

  // Clean up database after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /auth/signup', () => {
    test('Should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(302); // Redirect after successful signup

      // Check if user was created in database
      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    test('Should not register user with invalid username', async () => {
      const userData = {
        username: 'te', // Too short
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(302); // Redirect with error

      // Check if user was not created
      const user = await User.findOne({ username: 'te' });
      expect(user).toBeFalsy();
    });

    test('Should not register user with short password', async () => {
      const userData = {
        username: 'testuser',
        password: '123', // Too short
        confirmPassword: '123'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(302);

      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeFalsy();
    });

    test('Should not register user with mismatched passwords', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password456'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(302);

      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeFalsy();
    });

    test('Should not register user with existing username', async () => {
      // First, create a user
      const user = new User({
        username: 'testuser',
        password: 'password123'
      });
      await user.save();

      // Try to create another user with same username
      const userData = {
        username: 'testuser',
        password: 'password456',
        confirmPassword: 'password456'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(302);

      // Check that only one user exists
      const users = await User.find({ username: 'testuser' });
      expect(users.length).toBe(1);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const user = new User({
        username: 'testuser',
        password: 'password123'
      });
      await user.save();
    });

    test('Should login with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(302); // Redirect after successful login
    });

    test('Should not login with invalid username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(302); // Redirect with error
    });

    test('Should not login with invalid password', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(302);
    });

    test('Should not login with missing fields', async () => {
      const loginData = {
        username: 'testuser'
        // Missing password
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(302);
    });
  });

  describe('GET /auth/signup', () => {
    test('Should render signup page', async () => {
      const response = await request(app)
        .get('/auth/signup')
        .expect(200);

      expect(response.text).toContain('Sign Up');
    });
  });

  describe('GET /auth/login', () => {
    test('Should render login page', async () => {
      const response = await request(app)
        .get('/auth/login')
        .expect(200);

      expect(response.text).toContain('Login');
    });
  });
});