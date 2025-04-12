const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const path = require('path');

// Load env variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    console.log('Running without database functionality for demonstration');
  });

// Routes
try {
  app.use('/api', apiRoutes);

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/health-logs', require('./routes/healthLogs'));
  app.use('/api/insights', require('./routes/insights'));
} catch (error) {
  console.error('Error loading routes:', error);
  console.log('Setting up mock routes for demonstration');
  
  // Mock auth routes
  app.post('/api/auth/register', (req, res) => {
    try {
      console.log('Registration request received:', req.body);
      
      // Validate request body
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        console.log('Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password'
        });
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format');
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
      
      // Mock user object with data from request
      const user = {
        _id: Date.now().toString(),
        name: name,
        email: email,
        healthScore: 50,
        createdAt: new Date()
      };
      
      console.log('Creating user:', user);
      
      // Return success response
      const response = {
        success: true,
        message: 'User registered successfully',
        token: 'mock-jwt-token',
        user
      };
      
      console.log('Sending registration response:', response);
      return res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  });
  
  app.post('/api/auth/login', (req, res) => {
    try {
      console.log('Login request received:', req.body);
      
      // Validate request body
      const { email, password } = req.body;
      
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format');
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
      
      // Mock user response
      const user = {
        _id: '1',
        name: 'Demo User',
        email: email,
        healthScore: 72,
        createdAt: new Date()
      };
      
      console.log('User logged in:', user);
      
      // Return success response
      const response = {
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        user
      };
      
      console.log('Sending login response:', response);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  });
  
  app.get('/api/auth/user', (req, res) => {
    res.json({
      _id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      healthScore: 72,
      createdAt: new Date()
    });
  });
  
  // Mock health logs routes
  app.post('/api/health-logs', (req, res) => {
    res.status(201).json({
      success: true,
      data: {
        ...req.body,
        _id: 'mock-log-id',
        user: '1',
        date: new Date(),
        calculatedScore: 72
      }
    });
  });
  
  app.get('/api/health-logs', (req, res) => {
    res.json({
      success: true,
      count: 1,
      data: [{
        _id: 'mock-log-id',
        user: '1',
        date: new Date(),
        sleep: { hours: 7, quality: 'good' },
        mood: 'good',
        energy: 'moderate',
        water: { glasses: 6 },
        exercise: { didExercise: true, minutes: 30, type: 'walking' },
        nutrition: { meals: 3, junkFood: 1, fruits: 2, vegetables: 3 },
        calculatedScore: 72
      }]
    });
  });
  
  app.get('/api/health-logs/summary', (req, res) => {
    console.log('Serving health logs summary');
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    res.json({
      success: true,
      data: {
        latestLog: {
          _id: 'mock-log-id',
          user: '1',
          date: new Date(),
          sleep: { hours: 7, quality: 'good' },
          mood: 'good',
          energy: 'moderate',
          water: { glasses: 6 },
          exercise: { didExercise: true, minutes: 30, type: 'walking' },
          nutrition: { meals: 3, junkFood: 1, fruits: 2, vegetables: 3 },
          calculatedScore: 72
        },
        trends: {
          sleep: dates.map((date, i) => ({ date, value: 6 + Math.floor(Math.random() * 3) })),
          mood: dates.map((date, i) => ({ date, value: 3 + Math.floor(Math.random() * 3) })),
          water: dates.map((date, i) => ({ date, value: 5 + Math.floor(Math.random() * 4) })),
          exercise: dates.map((date, i) => ({ date, value: 15 + Math.floor(Math.random() * 30) })),
          scores: dates.map((date, i) => ({ date, value: 65 + Math.floor(Math.random() * 20) }))
        }
      }
    });
  });
  
  // Mock insights routes
  app.get('/api/insights/unread', (req, res) => {
    res.json({
      success: true,
      count: 2,
      data: [
        {
          _id: 'mock-insight-1',
          user: '1',
          date: new Date(),
          insightType: 'suggestion',
          title: 'Increase Water Intake',
          description: 'You\'ve been drinking an average of 5 glasses of water daily. Consider increasing to at least 8 glasses.',
          metrics: ['water'],
          severity: 'low',
          isRead: false,
          actionTaken: false,
          suggestedActions: [
            'Keep a water bottle nearby',
            'Set reminders to drink water throughout the day',
            'Drink a glass of water before each meal'
          ]
        },
        {
          _id: 'mock-insight-2',
          user: '1',
          date: new Date(),
          insightType: 'pattern',
          title: 'Good Sleep Pattern',
          description: 'You\'ve been maintaining a healthy sleep schedule of 7-8 hours per night. Keep it up!',
          metrics: ['sleep'],
          severity: 'low',
          isRead: false,
          actionTaken: false,
          suggestedActions: [
            'Continue your current bedtime routine',
            'Try to keep consistent sleep and wake times'
          ]
        }
      ]
    });
  });
  
  app.get('/api/insights', (req, res) => {
    res.json({
      success: true,
      count: 2,
      data: [
        {
          _id: 'mock-insight-1',
          user: '1',
          date: new Date(),
          insightType: 'suggestion',
          title: 'Increase Water Intake',
          description: 'You\'ve been drinking an average of 5 glasses of water daily. Consider increasing to at least 8 glasses.',
          metrics: ['water'],
          severity: 'low',
          isRead: false,
          actionTaken: false,
          suggestedActions: [
            'Keep a water bottle nearby',
            'Set reminders to drink water throughout the day',
            'Drink a glass of water before each meal'
          ]
        },
        {
          _id: 'mock-insight-2',
          user: '1',
          date: new Date(),
          insightType: 'pattern',
          title: 'Good Sleep Pattern',
          description: 'You\'ve been maintaining a healthy sleep schedule of 7-8 hours per night. Keep it up!',
          metrics: ['sleep'],
          severity: 'low',
          isRead: false,
          actionTaken: false,
          suggestedActions: [
            'Continue your current bedtime routine',
            'Try to keep consistent sleep and wake times'
          ]
        }
      ]
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Define PORT
const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
}); 