const mongoose = require('mongoose');

// Define the Health Data Schema
const HealthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now // Automatically set the timestamp to the current date and time
  },
  
  // Stress Level and Status (Simulated from logic)
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true, // Stress level on a scale of 1-10
    default: Math.floor(Math.random() * 10) + 1
  },
  stressLevelStatus: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    required: true, // Status based on the stress level
    default: function() {
      const stress = this.stressLevel;
      if (stress <= 3) return 'Low';
      if (stress <= 7) return 'Moderate';
      return 'High';
    }
  },
  
  // Mood (Derived from stress level)
  mood: {
    type: String,
    enum: ['Happy', 'Neutral', 'Sad'],
    required: true, // Mood derived from stress levels
    default: function() {
      const stress = this.stressLevel;
      if (stress <= 3) return 'Happy';
      if (stress <= 7) return 'Neutral';
      return 'Sad';
    }
  },
  
  // Relaxation Level (Derived from stress level)
  relaxationLevel: {
    type: String,
    enum: ['High', 'Moderate', 'Low'],
    required: true, // Relaxation level based on stress and posture
    default: function() {
      const stress = this.stressLevel;
      if (stress <= 3) return 'High';
      if (stress <= 7) return 'Moderate';
      return 'Low';
    }
  },
  
  // Fatigue Level (Simulated on a scale of 1-10)
  fatigueLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true, // Fatigue level on a scale of 1-10
    default: Math.floor(Math.random() * 10) + 1
  },
  
  // Respiratory Metrics (Simulated data for now)
  respiratoryRate: {
    type: Number,
    required: true, // Breaths per minute based on visual cues from chest movement or posture
    default: Math.floor(Math.random() * (20 - 12) + 12) // 12-20 bpm
  },
  respiratoryRateStatus: {
    type: String,
    enum: ['Normal', 'High', 'Low'],
    required: true, // Status based on respiratory rate
    default: function() {
      const rate = this.respiratoryRate;
      if (rate < 12) return 'Low';
      if (rate > 20) return 'High';
      return 'Normal';
    }
  },
  
  // Heart Rate (Simulated from body language or inferred from visuals)
  heartRate: {
    type: Number,
    required: true, // Heart rate in bpm
    default: Math.floor(Math.random() * (100 - 60) + 60) // 60-100 bpm
  },
  heartRateStatus: {
    type: String,
    enum: ['Normal', 'High', 'Low'],
    required: true, // Status based on heart rate
    default: function() {
      const rate = this.heartRate;
      if (rate < 60) return 'Low';
      if (rate > 100) return 'High';
      return 'Normal';
    }
  },
  
  // Oxygen Saturation (Simulated data for now)
  oxygenSaturation: {
    type: Number,
    required: true, // Oxygen saturation in %
    default: Math.floor(Math.random() * (100 - 94) + 94) // 94-100%
  },
  oxygenSaturationStatus: {
    type: String,
    enum: ['Normal', 'Low', 'Critical'],
    required: true, // Oxygen saturation status
    default: function() {
      const saturation = this.oxygenSaturation;
      if (saturation < 95) return 'Low';
      return 'Normal';
    }
  },
  
  // General Recommendations (Customized based on health data)
  recommendations: [{
    type: String // Array of health recommendations based on analyzed data
  }],
  
  // Raw Image Data (Base64 encoded)
  rawImageData: {
    type: String, // Store the raw image data as a base64 string
    select: false // Don't include in regular queries to avoid exposing large image data
  }
});

// Export the model based on the schema
module.exports = mongoose.model('HealthData', HealthDataSchema);
