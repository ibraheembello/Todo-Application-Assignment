const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Todo Endpoints', () => {
  let testUser;
  let userSession;

  // Setup test database connection
  beforeAll(async () => {
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp-test';
    await mongoose.connect(url);
  });

  // Setup test user and login session before each test
  beforeEach(async () => {
    // Clean up database
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({})
    ]);

    // Create test user with unique username
    testUser = new User({
      username: `test_${Math.floor(Math.random() * 9999)}`,
      password: 'password123'
    });
    await testUser.save();

    // Create session by logging in
    userSession = request.agent(app);
    await userSession
      .post('/auth/login')
      .send({
        username: testUser.username,
        password: 'password123'
      });
  });

  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /todos', () => {
    test('Should render todos page for authenticated user', async () => {
      const response = await userSession
        .get('/todos')
        .expect(200);

      expect(response.text).toContain('My Tasks');
    });

    test('Should redirect to login for unauthenticated user', async () => {
      const response = await request(app)
        .get('/todos')
        .expect(302);

      expect(response.header.location).toBe('/auth/login');
    });

    test('Should show pending tasks when filter=pending', async () => {
      // Create a pending task
      await new Task({
        title: 'Test Task',
        userId: testUser._id,
        status: 'pending'
      }).save();

      const response = await userSession
        .get('/todos?filter=pending')
        .expect(200);

      expect(response.text).toContain('Test Task');
    });

    test('Should show completed tasks when filter=completed', async () => {
      // Create a completed task
      await new Task({
        title: 'Completed Task',
        userId: testUser._id,
        status: 'completed'
      }).save();

      const response = await userSession
        .get('/todos?filter=completed')
        .expect(200);

      expect(response.text).toContain('Completed Task');
    });
  });

  describe('POST /todos/create', () => {
    test('Should create a new task successfully', async () => {
      const taskData = {
        title: 'New Test Task',
        description: 'This is a test task description'
      };

      const response = await userSession
        .post('/todos/create')
        .send(taskData)
        .expect(302); // Redirect after creation

      // Check if task was created in database
      const task = await Task.findOne({ title: 'New Test Task' });
      expect(task).toBeTruthy();
      expect(task.title).toBe('New Test Task');
      expect(task.description).toBe('This is a test task description');
      expect(task.status).toBe('pending');
      expect(task.userId.toString()).toBe(testUser._id.toString());
    });

    test('Should not create task with empty title', async () => {
      const taskData = {
        title: '',
        description: 'This task has no title'
      };

      const response = await userSession
        .post('/todos/create')
        .send(taskData)
        .expect(302);

      // Check that no task was created
      const task = await Task.findOne({ description: 'This task has no title' });
      expect(task).toBeFalsy();
    });

    test('Should create task without description', async () => {
      const taskData = {
        title: 'Task without description'
      };

      const response = await userSession
        .post('/todos/create')
        .send(taskData)
        .expect(302);

      const task = await Task.findOne({ title: 'Task without description' });
      expect(task).toBeTruthy();
      expect(task.description).toBeFalsy();
    });

    test('Should redirect to login for unauthenticated user', async () => {
      const taskData = {
        title: 'Unauthorized Task'
      };

      const response = await request(app)
        .post('/todos/create')
        .send(taskData)
        .expect(302);

      expect(response.header.location).toBe('/auth/login');
    });
  });

  describe('PATCH /todos/:id/status', () => {
    let testTask;

    beforeEach(async () => {
      testTask = new Task({
        title: 'Test Task for Status Update',
        userId: testUser._id,
        status: 'pending'
      });
      await testTask.save();
    });

    test('Should mark task as completed', async () => {
      const response = await userSession
        .patch(`/todos/${testTask._id}/status`)
        .send({ status: 'completed' })
        .expect(302);

      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.status).toBe('completed');
    });

    test('Should mark task as deleted', async () => {
      const response = await userSession
        .patch(`/todos/${testTask._id}/status`)
        .send({ status: 'deleted' })
        .expect(302);

      const updatedTask = await Task.findById(testTask._id);
      expect(updatedTask.status).toBe('deleted');
    });

    test('Should not update task of another user', async () => {
      // Create another user and task
      const otherUser = new User({
        username: 'otheruser',
        password: 'password123'
      });
      await otherUser.save();

      const otherTask = new Task({
        title: 'Other User Task',
        userId: otherUser._id,
        status: 'pending'
      });
      await otherTask.save();

      const response = await userSession
        .patch(`/todos/${otherTask._id}/status`)
        .send({ status: 'completed' })
        .expect(302);

      // Task should remain unchanged
      const unchangedTask = await Task.findById(otherTask._id);
      expect(unchangedTask.status).toBe('pending');
    });

    test('Should not accept invalid status', async () => {
      const response = await userSession
        .patch(`/todos/${testTask._id}/status`)
        .send({ status: 'invalid-status' })
        .expect(302);

      // Task status should remain unchanged
      const unchangedTask = await Task.findById(testTask._id);
      expect(unchangedTask.status).toBe('pending');
    });
  });

  describe('GET /todos/:id', () => {
    let testTask;

    beforeEach(async () => {
      testTask = new Task({
        title: 'Test Task Details',
        description: 'Test task description for details view',
        userId: testUser._id,
        status: 'pending'
      });
      await testTask.save();
    });

    test('Should show task details for owner', async () => {
      const response = await userSession
        .get(`/todos/${testTask._id}`)
        .expect(200);

      expect(response.text).toContain('Test Task Details');
      expect(response.text).toContain('Test task description for details view');
    });

    test('Should not show task details for non-owner', async () => {
      // Create another user and login
      const otherUser = new User({
        username: 'otheruser',
        password: 'password123'
      });
      await otherUser.save();

      const otherSession = request.agent(app);
      await otherSession
        .post('/auth/login')
        .send({
          username: 'otheruser',
          password: 'password123'
        });

      const response = await otherSession
        .get(`/todos/${testTask._id}`)
        .expect(302); // Should redirect with error
    });

    test('Should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await userSession
        .get(`/todos/${fakeId}`)
        .expect(302); // Redirect with error
    });
  });

  describe('GET /todos/create', () => {
    test('Should render create task page for authenticated user', async () => {
      const response = await userSession
        .get('/todos/create')
        .expect(200);

      expect(response.text).toContain('Create New Task');
    });

    test('Should redirect to login for unauthenticated user', async () => {
      const response = await request(app)
        .get('/todos/create')
        .expect(302);

      expect(response.header.location).toBe('/auth/login');
    });
  });
});