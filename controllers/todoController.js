const Task = require('../models/Task');
const logger = require('../utils/logger');
const Joi = require('joi');

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().trim().max(500).allow('')
});

const updateTaskSchema = Joi.object({
  status: Joi.string().valid('pending', 'completed', 'deleted').required()
});

class TodoController {
  // Get all tasks for authenticated user
  static getTasks = async (req, res) => {
    try {
      const userId = req.session.user.id;
      const filter = req.query.filter || 'all';
      
      // Build query based on filter
      let query = { userId, status: { $ne: 'deleted' } };
      
      if (filter === 'pending') {
        query.status = 'pending';
      } else if (filter === 'completed') {
        query.status = 'completed';
      }

      // Get tasks and count
      const tasks = await Task.find(query).sort({ createdAt: -1 });
      const pendingCount = await Task.countDocuments({ userId, status: 'pending' });
      const completedCount = await Task.countDocuments({ userId, status: 'completed' });

      logger.info(`User ${req.session.user.username} viewed tasks - Filter: ${filter}`);

      res.render('todos/index', {
        title: 'My Tasks',
        tasks,
        filter,
        pendingCount,
        completedCount
      });

    } catch (error) {
      logger.error('Get tasks error:', error);
      req.flash('error', 'Failed to load tasks');
      res.redirect('/');
    }
  };

  // Render create task page
  static getCreateTask = (req, res) => {
    res.render('todos/create', {
      title: 'Create Task'
    });
  };

  // Create new task
  static createTask = async (req, res) => {
    try {
      // Validate input
      const { error, value } = createTaskSchema.validate(req.body);
      if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/todos/create');
      }

      const { title, description } = value;
      const userId = req.session.user.id;

      // Create task
      const task = new Task({
        title,
        description,
        userId
      });

      await task.save();

      logger.info(`Task created by ${req.session.user.username}: ${title}`);
      req.flash('success', 'Task created successfully!');
      res.redirect('/todos');

    } catch (error) {
      logger.error('Create task error:', error);
      req.flash('error', 'Failed to create task');
      res.redirect('/todos/create');
    }
  };

  // Update task status
  static updateTaskStatus = async (req, res) => {
    try {
      const taskId = req.params.id;
      const userId = req.session.user.id;

      // Validate input
      const { error, value } = updateTaskSchema.validate(req.body);
      if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/todos');
      }

      const { status } = value;

      // Find and update task (ensure user owns the task)
      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId },
        { status },
        { new: true }
      );

      if (!task) {
        req.flash('error', 'Task not found or unauthorized');
        return res.redirect('/todos');
      }

      logger.info(`Task status updated by ${req.session.user.username}: ${task.title} -> ${status}`);
      
      const statusMessages = {
        'completed': 'Task marked as completed!',
        'pending': 'Task marked as pending!',
        'deleted': 'Task deleted successfully!'
      };

      req.flash('success', statusMessages[status]);
      res.redirect('/todos');

    } catch (error) {
      logger.error('Update task status error:', error);
      req.flash('error', 'Failed to update task');
      res.redirect('/todos');
    }
  };

  // Get task details
  static getTaskDetails = async (req, res) => {
    try {
      const taskId = req.params.id;
      const userId = req.session.user.id;

      const task = await Task.findOne({ _id: taskId, userId });

      if (!task) {
        req.flash('error', 'Task not found');
        return res.redirect('/todos');
      }

      res.render('todos/details', {
        title: 'Task Details',
        task
      });

    } catch (error) {
      logger.error('Get task details error:', error);
      req.flash('error', 'Failed to load task details');
      res.redirect('/todos');
    }
  };
}

module.exports = TodoController;