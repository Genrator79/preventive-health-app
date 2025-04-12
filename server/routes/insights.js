const express = require('express');
const auth = require('../middleware/auth');
const HealthInsight = require('../models/HealthInsight');

const router = express.Router();

// @route   GET api/insights
// @desc    Get all insights for current user
// @access  Private
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

// @route   GET api/insights/unread
// @desc    Get unread insights for current user
// @access  Private
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

// @route   PUT api/insights/:id/read
// @desc    Mark an insight as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    let insight = await HealthInsight.findById(req.params.id);
    
    // Check if insight exists
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    // Check insight belongs to user
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

// @route   PUT api/insights/:id/action
// @desc    Mark an insight as actioned
// @access  Private
router.put('/:id/action', auth, async (req, res) => {
  try {
    let insight = await HealthInsight.findById(req.params.id);
    
    // Check if insight exists
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    // Check insight belongs to user
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