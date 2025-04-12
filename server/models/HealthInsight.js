const mongoose = require('mongoose');

const HealthInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  insightType: {
    type: String,
    enum: ['pattern', 'suggestion', 'alert', 'achievement'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metrics: {
    type: [String],
    required: true,
    enum: ['sleep', 'mood', 'energy', 'water', 'exercise', 'nutrition', 'symptoms']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: Boolean,
    default: false
  },
  suggestedActions: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('HealthInsight', HealthInsightSchema); 