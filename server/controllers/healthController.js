const HealthData = require('../models/HealthData');
const { analyzeImage } = require('../utils/imageAnalysis');

// Analyze health from uploaded image
exports.analyzeHealth = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // In a real app, we'd use actual image analysis here
    // For hackathon demo, we'll use simulated analysis
  
    const healthMetrics = await analyzeImage(req.file || req.body.image);
    
    // In a real app, we'd save this after authentication
    const userId = req.user ? req.user._id : '645a1d7e1f8f09a1ec489f12'; // Demo user ID
    
    // Save the health data
    const healthData = new HealthData({
      userId,
      ...healthMetrics,
      rawImageData: req.body.saveImage ? (req.file ? req.file.buffer.toString('base64') : req.body.image) : undefined
    });
    
    await healthData.save();
    
    // Return the analysis results
    res.json(healthMetrics);
  } catch (error) {
    console.error('Health analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze health data' });
  }
};

// Get health history for user
exports.getHealthHistory = async (req, res) => {
  try {
    // In a real app, we'd get the user ID from authenticated session
    const userId = req.user ? req.user._id : '645a1d7e1f8f09a1ec489f12'; // Demo user ID
    
    const healthData = await HealthData.find({ userId })
      .sort({ timestamp: -1 })
      .limit(30); // Last 30 records
    
    res.json(healthData);
  } catch (error) {
    console.error('Health history error:', error);
    res.status(500).json({ error: 'Failed to retrieve health history' });
  }
};

