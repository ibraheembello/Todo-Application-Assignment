const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  // Setup test database connection
  beforeAll(async () => {
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp-test';
    await mongoose.connect(url);
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

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
        .expect(302)
        .expect('Location', '/auth/login'); // Verify redirect to login page

      // Add delay before DB check
      await new Promise(resolve => setTimeout(resolve, 100));

      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
      // Verify password was hashed
      expect(user.password).not.toBe('password123');
      expect(await user.comparePassword('password123')).toBeTruthy();
    });

    test('Should not register user with invalid username', async () => {
      const userData = {
        username: 'te',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(302);

      // Verify flash message
      expect(response.headers['location']).toBe('/auth/signup');
      
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
      await user.hashPassword();
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

      // Add a delay to ensure database operation completes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check that only one user exists
      const users = await User.find({ username: 'testuser' });
      expect(users.length).toBe(1);
    });
  });

  describe('POST /auth/login', () => {
    let testUser;

    beforeEach(async () => {
      await User.deleteMany({});
      // Create test user properly using the schema methods
      testUser = new User({
        username: 'testuser',
        password: 'password123'
      });
      await testUser.save(); // This will automatically hash the password
    });

    test('Should login with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(302)
        .expect('Location', '/todos');

      // Verify session cookie
      const cookie = response.headers['set-cookie'];
      expect(cookie).toBeDefined();
      expect(cookie[0]).toMatch(/connect.sid/);
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

  // Add new test for logout functionality
  describe('POST /auth/logout', () => {
    test('Should logout successfully', async () => {
      const agent = request.agent(app);
      
      // Login first
      await agent
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      // Then test logout
      const response = await agent
        .post('/auth/logout')
        .expect(302)
        .expect('Location', '/');

      // Verify session was destroyed
      expect(response.headers['set-cookie'][0])
        .toMatch(/connect.sid=;/);
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