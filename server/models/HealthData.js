const mongoose = require('mongoose');

const HealthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now 
  },
  
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true, 
    default: Math.floor(Math.random() * 10) + 1
  },
  stressLevelStatus: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    required: true, 
    default: function() {
      const stress = this.stressLevel;
      if (stress <= 3) return 'Low';
      if (stress <= 7) return 'Moderate';
      return 'High';
    }
  },

  mood: {
    type: String,
    enum: ['Happy', 'Neutral', 'Sad'],
    required: true, 
    default: function() {
      const stress = this.stressLevel;
      if (stress <= 3) return 'Happy';
      if (stress <= 7) return 'Neutral';
      return 'Sad';
    }
  },

  relaxationLevel: {
    type: String,
    enum: ['High', 'Moderate', 'Low'],
    required: true, 
    default: function() {
      const stress = this.stressLevel;
      if (stress <= 3) return 'High';
      if (stress <= 7) return 'Moderate';
      return 'Low';
    }
  },
  
  fatigueLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true, 
    default: Math.floor(Math.random() * 10) + 1
  },
  
  respiratoryRate: {
    type: Number,
    required: true, 
    default: Math.floor(Math.random() * (20 - 12) + 12) 
  },
  respiratoryRateStatus: {
    type: String,
    enum: ['Normal', 'High', 'Low'],
    required: true, 
    default: function() {
      const rate = this.respiratoryRate;
      if (rate < 12) return 'Low';
      if (rate > 20) return 'High';
      return 'Normal';
    }
  },
  
  heartRate: {
    type: Number,
    required: true,
    default: Math.floor(Math.random() * (100 - 60) + 60) 
  },
  heartRateStatus: {
    type: String,
    enum: ['Normal', 'High', 'Low'],
    required: true, 
    default: function() {
      const rate = this.heartRate;
      if (rate < 60) return 'Low';
      if (rate > 100) return 'High';
      return 'Normal';
    }
  },
  
  oxygenSaturation: {
    type: Number,
    required: true, 
    default: Math.floor(Math.random() * (100 - 94) + 94) 
  },
  oxygenSaturationStatus: {
    type: String,
    enum: ['Normal', 'Low', 'Critical'],
    required: true, 
    default: function() {
      const saturation = this.oxygenSaturation;
      if (saturation < 95) return 'Low';
      return 'Normal';
    }
  },
  
  recommendations: [{
    type: String 
  }],
  
  rawImageData: {
    type: String, 
    select: false 
  }
});

module.exports = mongoose.model('HealthData', HealthDataSchema);
