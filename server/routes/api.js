const express = require('express');
const router = express.Router();
const multer = require('multer');
const healthController = require('../controllers/healthController');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  }
});

router.post('/analyze', upload.single('image'), healthController.analyzeHealth);

router.get('/health-data', healthController.getHealthHistory);

module.exports = router;

