exports.analyzeImage = async (image) => {
  console.log('Processing image for health metrics analysis');
  
  try {
    // Use Face++ to analyze facial expressions and emotions
    const visionAnalysis = await analyzeWithFacePP(image);
    
    // Extract health metrics from the vision analysis
    const {
      stressLevel,
      mood,
      relaxationLevel,
      fatigueLevel
    } = extractHealthMetricsFromFacePP(visionAnalysis);
    
    console.log(`Extracted metrics - Stress: ${stressLevel}, Mood: ${mood}, Relaxation: ${relaxationLevel}, Fatigue: ${fatigueLevel}`);
    
    // Generate personalized recommendations based on metrics
    const recommendations = generateRecommendations(stressLevel, mood, relaxationLevel, fatigueLevel);
    
    // Return the analyzed health data
    return {
      stressLevel,
      mood,
      relaxationLevel,
      fatigueLevel,
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return { 
      error: `Failed to analyze health data: ${error.message}`,
      errorDetails: error.stack
    };
  }
};

// Function to analyze image with Face++ API
async function analyzeWithFacePP(image) {
  const axios = require('axios');
  const FormData = require('form-data');
  
  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append('api_key', process.env.FACEPP_API_KEY || 'your_facepp_api_key_here');
    formData.append('api_secret', process.env.FACEPP_API_SECRET || 'your_facepp_api_secret_here');
    
    // Handle different image input formats
    if (Buffer.isBuffer(image)) {
      formData.append('image_file', image, { filename: 'image.jpg' });
    } else if (image.buffer) {
      formData.append('image_file', image.buffer, { filename: 'image.jpg' });
    } else if (typeof image === 'string' && image.startsWith('http')) {
      formData.append('image_url', image);
    } else {
      throw new Error('Unsupported image format');
    }
    
    // Set return attributes to get emotion data
    formData.append('return_attributes', 'emotion,age,gender,smiling,headpose');
    
    // Make the API request to Face++ Detect API
    const response = await axios.post(
      'https://api-us.faceplusplus.com/facepp/v3/detect',
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 15000
      }
    );
    
    if (response.data.error_message) {
      throw new Error(`Face++ API error: ${response.data.error_message}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Face++ API error:', error);
    throw new Error(`Face++ analysis failed: ${error.message}`);
  }
}

// Function to extract health metrics from Face++ analysis
function extractHealthMetricsFromFacePP(faceppData) {
  try {
    // Check if faces were detected
    if (!faceppData.faces || faceppData.faces.length === 0) {
      throw new Error('No faces detected in the image');
    }
    
    // Use the first face detected for analysis
    const face = faceppData.faces[0];
    const emotions = face.attributes.emotion || {};
    const headpose = face.attributes.headpose || {};
    const smile = face.attributes.smile?.value || 0;
    
    // Calculate stress level based on negative emotions (1-10)
    const stressIndicators = [
      emotions.anger || 0, 
      emotions.fear || 0,
      emotions.disgust || 0,
      emotions.sadness || 0,
      100 - (emotions.neutral || 0) // Inverted neutral as stress indicator
    ];
    
    // Calculate average and convert to 1-10 scale
    const stressLevel = Math.min(10, Math.ceil(
      (stressIndicators.reduce((sum, val) => sum + val, 0) / stressIndicators.length) / 10
    ));
    
    // Determine mood based on emotions
    let mood;
    if ((emotions.happiness || 0) > 50 || smile > 50) {
      mood = 'Happy';
    } else if ((emotions.sadness || 0) > 30 || (emotions.anger || 0) > 30 || stressLevel > 7) {
      mood = 'Sad';
    } else {
      mood = 'Neutral';
    }
    
    // Determine relaxation level based on stress level
    let relaxationLevel;
    if (stressLevel <= 3) {
      relaxationLevel = 'High';
    } else if (stressLevel <= 6) {
      relaxationLevel = 'Moderate';
    } else {
      relaxationLevel = 'Low';
    }
    
    // Calculate fatigue level based on various indicators (1-10)
    // Lower happiness and higher sadness can indicate fatigue
    const fatigueIndicators = [
      (100 - (emotions.happiness || 0)) / 20, // Convert to 0-5 scale
      (emotions.sadness || 0) / 20,           // Convert to 0-5 scale
      Math.abs(headpose.pitch_angle || 0) / 9 // Head drooping can indicate fatigue (0-10)
    ];
    
    const fatigueLevel = Math.min(10, Math.ceil(
      fatigueIndicators.reduce((sum, val) => sum + val, 0) / fatigueIndicators.length * 2
    ));
    
    return {
      stressLevel,
      mood,
      relaxationLevel,
      fatigueLevel
    };
  } catch (error) {
    console.error('Error extracting health metrics from Face++ data:', error);
    throw new Error(`Metrics extraction failed: ${error.message}`);
  }
}

// Function to generate personalized recommendations
function generateRecommendations(stressLevel, mood, relaxationLevel, fatigueLevel) {
  const recommendations = [];
  
  // Stress level-based suggestions
  if (stressLevel >= 7) {
    recommendations.push('Your facial expressions indicate high stress. Consider practicing mindfulness or relaxation techniques.');
  } else if (stressLevel >= 4 && stressLevel <= 6) {
    recommendations.push('You appear to have moderate stress levels. Taking short breaks and deep breathing may be beneficial.');
  } else {
    recommendations.push('Your facial analysis shows low stress levels. Keep up with your stress management practices!');
  }
  
  // Mood-based suggestions
  if (mood === 'Sad') {
    recommendations.push('Your facial expressions suggest you may be feeling down. Take some time for self-care or speak to a loved one.');
  } else if (mood === 'Neutral') {
    recommendations.push('Your mood appears balanced. Consider activities that bring you joy to enhance your wellbeing.');
  } else if (mood === 'Happy') {
    recommendations.push('Your facial expressions indicate a positive mood! Stay positive and maintain your well-being practices.');
  }
  
  // Relaxation level-based suggestions
  if (relaxationLevel === 'Low') {
    recommendations.push('Your facial features suggest tension. Consider stretching exercises or progressive muscle relaxation.');
  } else if (relaxationLevel === 'Moderate') {
    recommendations.push('You appear moderately relaxed. Regular short meditation sessions could help increase relaxation.');
  } else {
    recommendations.push('Analysis shows you appear well-relaxed. Maintain these good relaxation states with continued self-care.');
  }
  
  // Fatigue-based suggestions
  if (fatigueLevel >= 7) {
    recommendations.push('Your facial features suggest fatigue. Ensure you re getting enough sleep and consider adjusting your sleep schedule.');
  } else if (fatigueLevel >= 4 && fatigueLevel <= 6) {
    recommendations.push('You show moderate signs of fatigue. Try to incorporate short power naps or better sleep hygiene.');
  } else {
    recommendations.push('You appear well-rested based on facial analysis. Keep up your energy levels with regular activity breaks.');
  }
  
  // General health recommendations
  recommendations.push(
    'Stay hydrated by drinking at least 8 glasses of water daily.',
    'Aim for 7-9 hours of quality sleep each night for optimal health.',
    'Include at least 30 minutes of moderate physical activity in your daily routine.'
  );
  
  return recommendations;
}