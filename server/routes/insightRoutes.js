const express = require('express');
const router = express.Router();
const { generateInsights } = require('../controllers/insightController');
const auth = require('../middleware/auth');

router.get('/', auth, generateInsights);

module.exports = router; 