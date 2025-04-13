const axios = require('axios');
const HealthLog = require('../models/HealthLog');

const GEMINI_API_KEY = 'AIzaSyA-qY8qIdfXehpniTStY_l6vkGyET_b-uM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const generateInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Generating insights for user:', userId);
    
    // Fetch user's health logs
    const logs = await HealthLog.find({ user: userId })
      .sort({ date: -1 })
      .limit(30); // Get last 30 days of logs
    
    console.log('Found logs:', logs.length);
    
    if (!logs || logs.length === 0) {
      console.log('No logs found for user');
      return res.status(200).json({
        success: true,
        data: {
          message: "No insights available yet. Keep logging your health data regularly. Our AI will analyze your patterns and provide personalized insights to help improve your health."
        }
      });
    }

    // Prepare data for Gemini AI
    const healthData = logs.map(log => ({
      date: new Date(log.date).toLocaleDateString(),
      sleep: {
        hours: log.sleep?.hours || 0,
        quality: log.sleep?.quality || 'unknown'
      },
      mood: log.mood || 'unknown',
      water: {
        glasses: log.water?.glasses || 0
      },
      exercise: {
        didExercise: log.exercise?.didExercise || false,
        minutes: log.exercise?.minutes || 0,
        type: log.exercise?.type || 'none'
      },
      nutrition: {
        meals: log.nutrition?.meals || 0,
        junkFood: log.nutrition?.junkFood || 0,
        fruits: log.nutrition?.fruits || 0,
        vegetables: log.nutrition?.vegetables || 0
      },
      calculatedScore: log.calculatedScore || 0
    }));

    console.log('Prepared health data for analysis');

    // Create the prompt
    const prompt = `You are a health analysis AI. Analyze this health data and provide 3-5 key insights. 
    Data: ${JSON.stringify(healthData, null, 2)}
    
    Analyze the following aspects:
    1. Sleep patterns and quality
    2. Mood trends
    3. Water intake consistency
    4. Exercise frequency and types
    5. Nutrition habits
    6. Overall health score trends
    
    For each insight, provide:
    1. A clear title
    2. A detailed description of the pattern or observation
    3. The type (pattern, suggestion, or alert)
    4. Severity level (low, medium, or high)
    5. Relevant metrics
    6. 2-3 specific, actionable recommendations
    
    Format the response as a valid JSON object with this exact structure:
    {
      "insights": [
        {
          "title": "string",
          "description": "string",
          "type": "pattern|suggestion|alert",
          "severity": "low|medium|high",
          "metrics": ["string"],
          "suggestedActions": ["string"]
        }
      ]
    }`;

    console.log('Sending request to Gemini AI');
    
    // Make API call to Gemini
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    console.log('Received response from Gemini AI:', text);

    // Parse the response
    let insights;
    try {
      // Extract JSON from the response text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure the response has the correct structure
        insights = {
          insights: Array.isArray(parsed.insights) ? parsed.insights : []
        };
        console.log('Parsed insights:', insights);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // If parsing fails, create a default insight
      insights = {
        insights: [{
          title: "Health Analysis",
          description: "Your health data has been analyzed. Here are some observations about your recent health patterns.",
          type: "pattern",
          severity: "low",
          metrics: ["overall"],
          suggestedActions: [
            "Continue tracking your health metrics",
            "Maintain consistent sleep patterns",
            "Stay hydrated throughout the day"
          ]
        }]
      };
    }

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      details: error.message
    });
  }
};

module.exports = {
  generateInsights
}; 