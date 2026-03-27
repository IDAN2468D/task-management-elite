const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active',
  },
  themeColor: {
    type: String,
    default: '#6366f1', // Indigo first
  },
  meshGradientColors: {
    type: [String],
    default: ['#4f46e5', '#818cf8', '#312e81'], // Default premium palette
  },
  aiSummary: {
    type: String,
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  metadata: {
    suggestedSubtasks: [String],
    targetAudience: String,
    category: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', ProjectSchema);
