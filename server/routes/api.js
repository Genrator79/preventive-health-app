const express = require('express');
const router = express.Router();
const multer = require('multer');
const healthController = require('../controllers/healthController');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Health analysis endpoint
router.post('/analyze', upload.single('image'), healthController.analyzeHealth);

// Get health history endpoint
router.get('/health-data', healthController.getHealthHistory);

module.exports = router;

