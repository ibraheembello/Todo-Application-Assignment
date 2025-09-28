const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Task title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Task description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'deleted'],
    default: 'pending'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted creation date
taskSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);