const express = require('express');
const auth = require('../middleware/auth');
const HealthInsight = require('../models/HealthInsight');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const insights = await HealthInsight.find({ user: req.user.id })
      .sort({ date: -1 });
    
    res.json({
      success: true,
      count: insights.length,
      data: insights
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/unread', auth, async (req, res) => {
  try {
    const insights = await HealthInsight.find({ 
      user: req.user.id,
      isRead: false
    }).sort({ date: -1 });
    
    res.json({
      success: true,
      count: insights.length,
      data: insights
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    let insight = await HealthInsight.findById(req.params.id);
   
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    if (insight.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    insight = await HealthInsight.findByIdAndUpdate(
      req.params.id, 
      { isRead: true },
      { new: true }
    );
    
    res.json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/action', auth, async (req, res) => {
  try {
    let insight = await HealthInsight.findById(req.params.id);
    
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    if (insight.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    insight = await HealthInsight.findByIdAndUpdate(
      req.params.id, 
      { actionTaken: true, isRead: true },
      { new: true }
    );
    
    res.json({
      success: true,
      data: insight
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 