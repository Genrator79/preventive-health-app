const mongoose = require('mongoose');

const HealthLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  sleep: {
    hours: {
      type: Number,
      min: 0,
      max: 24
    },
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
    }
  },
  mood: {
    type: String,
    enum: ['terrible', 'bad', 'neutral', 'good', 'great'],
  },
  energy: {
    type: String,
    enum: ['very low', 'low', 'moderate', 'high', 'very high'],
  },
  water: {
    glasses: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  exercise: {
    didExercise: {
      type: Boolean,
      default: false
    },
    minutes: {
      type: Number,
      min: 0,
      default: 0
    },
    type: {
      type: String
    }
  },
  nutrition: {
    meals: {
      type: Number,
      min: 0,
      default: 0
    },
    junkFood: {
      type: Number,
      min: 0,
      default: 0
    },
    fruits: {
      type: Number,
      min: 0,
      default: 0
    },
    vegetables: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  symptoms: [{
    name: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    notes: String
  }],
  notes: {
    type: String
  },
  calculatedScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, { timestamps: true });

HealthLogSchema.methods.calculateHealthScore = function() {
  let score = 50;
  
  if (this.sleep.hours) {
    if (this.sleep.hours >= 7 && this.sleep.hours <= 9) {
      score += 25;
    } else if (this.sleep.hours >= 6 && this.sleep.hours < 7) {
      score += 15;
    } else if (this.sleep.hours > 9 && this.sleep.hours <= 10) {
      score += 15;
    } else {
      score += 5;
    }
  }
  
  if (this.water.glasses) {
    if (this.water.glasses >= 8) {
      score += 15;
    } else if (this.water.glasses >= 5) {
      score += 10;
    } else if (this.water.glasses >= 3) {
      score += 5;
    }
  }
  
  if (this.exercise.didExercise) {
    if (this.exercise.minutes >= 30) {
      score += 20;
    } else if (this.exercise.minutes >= 15) {
      score += 10;
    } else {
      score += 5;
    }
  }
  
  let nutritionScore = 0;
  if (this.nutrition.fruits >= 2) nutritionScore += 5;
  if (this.nutrition.vegetables >= 3) nutritionScore += 5;
  if (this.nutrition.junkFood === 0) nutritionScore += 10;
  else if (this.nutrition.junkFood === 1) nutritionScore += 5;
  
  score += nutritionScore;
  
  if (this.symptoms && this.symptoms.length > 0) {
    let severityDeduction = 0;
    this.symptoms.forEach(symptom => {
      if (symptom.severity === 'severe') severityDeduction += 10;
      else if (symptom.severity === 'moderate') severityDeduction += 5;
      else if (symptom.severity === 'mild') severityDeduction += 2;
    });
    score = Math.max(0, score - Math.min(20, severityDeduction));
  }
  
  this.calculatedScore = Math.min(100, Math.max(0, score));
  return this.calculatedScore;
};

module.exports = mongoose.model('HealthLog', HealthLogSchema); 