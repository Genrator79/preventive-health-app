const HealthData = require('../models/HealthData');
const { analyzeImage } = require('../utils/imageAnalysis');

exports.analyzeHealth = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const healthMetrics = await analyzeImage(req.file || req.body.image);
    
    const userId = req.user ? req.user._id : '645a1d7e1f8f09a1ec489f12'; // Demo user ID
    
    const healthData = new HealthData({
      userId,
      ...healthMetrics,
      rawImageData: req.body.saveImage ? (req.file ? req.file.buffer.toString('base64') : req.body.image) : undefined
    });
    
    await healthData.save();
    
    res.json(healthMetrics);
  } catch (error) {
    console.error('Health analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze health data' });
  }
};

exports.getHealthHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : '645a1d7e1f8f09a1ec489f12'; 
    
    const healthData = await HealthData.find({ userId })
      .sort({ timestamp: -1 })
      .limit(30);
    
    res.json(healthData);
  } catch (error) {
    console.error('Health history error:', error);
    res.status(500).json({ error: 'Failed to retrieve health history' });
  }
};

