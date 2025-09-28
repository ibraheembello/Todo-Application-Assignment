const express = require('express');
const TodoController = require('../controllers/todoController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Task routes
router.get('/', TodoController.getTasks);
router.get('/create', TodoController.getCreateTask);
router.post('/create', TodoController.createTask);
router.get('/:id', TodoController.getTaskDetails);
router.patch('/:id/status', TodoController.updateTaskStatus);

module.exports = router;