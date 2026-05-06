const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      tasks = await Task.find().populate('project assignee', 'name title');
    } else {
      tasks = await Task.find({ assignee: req.user._id }).populate(
        'project assignee',
        'name title'
      );
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
router.post('/', protect, authorize('Admin'), async (req, res) => {
  const { title, description, project, assignee, status, priority, dueDate } =
    req.body;

  try {
    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      status,
      priority,
      dueDate,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only Admin or the Assignee can update status
    if (
      req.user.role !== 'Admin' &&
      task.assignee.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
