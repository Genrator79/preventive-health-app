import { useState, useEffect } from 'react';
import axios from 'axios';
import { LightBulbIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, TrophyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        try {
          const res = await axios.get('http://localhost:5001/api/insights');
          setInsights(res.data.data);
        } catch (err) {
          console.warn('Could not fetch insights, using mock data:', err);
          setInsights(getMockInsights());
        }
        setLoading(false);
      } catch (err) {
        console.error('Error in insights initialization:', err);
        setError('Failed to load insights');
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Mock data for fallback
  const getMockInsights = () => {
    return [
      {
        _id: 'mock-insight-1',
        user: '1',
        date: new Date(),
        insightType: 'suggestion',
        title: 'Increase Water Intake',
        description: 'You\'ve been drinking an average of 5 glasses of water daily. Consider increasing to at least 8 glasses for better hydration and overall health.',
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
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        insightType: 'pattern',
        title: 'Good Sleep Pattern',
        description: 'You\'ve been maintaining a healthy sleep schedule of 7-8 hours per night for the past week. Keep it up! Consistent sleep is associated with improved cognitive function and mood.',
        metrics: ['sleep'],
        severity: 'low',
        isRead: true,
        actionTaken: true,
        suggestedActions: [
          'Continue your current bedtime routine',
          'Try to keep consistent sleep and wake times'
        ]
      },
      {
        _id: 'mock-insight-3',
        user: '1',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        insightType: 'alert',
        title: 'High Stress Level',
        description: 'Your reported stress levels have been increasing over the past 10 days. Chronic stress can impact your health in many ways. Consider adding relaxation techniques to your daily routine.',
        metrics: ['stress', 'mood'],
        severity: 'medium',
        isRead: false,
        actionTaken: false,
        suggestedActions: [
          'Try deep breathing exercises',
          'Practice meditation for 10 minutes daily',
          'Take short breaks during work hours',
          'Consider walking in nature when possible'
        ]
      },
      {
        _id: 'mock-insight-4',
        user: '1',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        insightType: 'achievement',
        title: 'Exercise Goal Reached',
        description: 'Congratulations! You\'ve reached your exercise goal of 30 minutes daily for 5 consecutive days. Regular exercise contributes to better cardiovascular health and improved mood.',
        metrics: ['exercise'],
        severity: 'low',
        isRead: true,
        actionTaken: false,
        suggestedActions: [
          'Consider increasing intensity gradually',
          'Mix different types of exercise for better results',
          'Share your achievement with friends'
        ]
      }
    ];
  };

  const handleMarkAsRead = async (id) => {
    try {
      try {
        await axios.put(`http://localhost:5001/api/insights/${id}/read`);
      } catch (err) {
        console.warn('API call failed, updating state locally:', err);
      }
      setInsights(insights.map(insight => 
        insight._id === id ? { ...insight, isRead: true } : insight
      ));
    } catch (err) {
      console.error('Error marking insight as read:', err);
    }
  };

  const handleActionTaken = async (id) => {
    try {
      try {
        await axios.put(`http://localhost:5001/api/insights/${id}/action`);
      } catch (err) {
        console.warn('API call failed, updating state locally:', err);
      }
      setInsights(insights.map(insight => 
        insight._id === id ? { ...insight, isRead: true, actionTaken: true } : insight
      ));
    } catch (err) {
      console.error('Error marking action as taken:', err);
    }
  };

  // Format date to readable string
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get the appropriate icon based on insight type
  const getInsightIcon = (type) => {
    switch (type) {
      case 'alert':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'pattern':
        return <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />;
      case 'suggestion':
        return <LightBulbIcon className="h-6 w-6 text-green-600" />;
      case 'achievement':
        return <TrophyIcon className="h-6 w-6 text-yellow-600" />;
      default:
        return <LightBulbIcon className="h-6 w-6 text-primary-600" />;
    }
  };

  // Get style based on insight type
  const getInsightStyle = (type) => {
    switch (type) {
      case 'alert':
        return 'border-red-500 bg-red-50';
      case 'pattern':
        return 'border-blue-500 bg-blue-50';
      case 'suggestion':
        return 'border-green-500 bg-green-50';
      case 'achievement':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-primary-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 animate-pulse-slow">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-6 mb-6 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3 mr-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 btn-primary bg-red-600 hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
            Health Insights
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered insights based on your health patterns and trends
          </p>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <LightBulbIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Keep logging your health data regularly. Our AI will analyze your patterns and provide personalized insights to help improve your health.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div 
              key={insight._id} 
              className={`card border-l-4 ${getInsightStyle(insight.insightType)} animate-slide-up`} 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-white p-2 rounded-full shadow-sm">
                    {getInsightIcon(insight.insightType)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 sm:mb-0">{insight.title}</h3>
                      <div className="flex items-center">
                        {insight.actionTaken && (
                          <span className="inline-flex items-center mr-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        )}
                        <p className="text-sm text-gray-500">{formatDate(insight.date)}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600">{insight.description}</p>
                    
                    {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                      <div className="mt-4 p-4 bg-white rounded-md shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggested Actions:</h4>
                        <ul className="space-y-1">
                          {insight.suggestedActions.map((action, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-primary-500 mr-2">•</span>
                              <span className="text-sm text-gray-600">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!insight.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(insight._id)}
                          className="btn-secondary text-sm"
                        >
                          Mark as Read
                        </button>
                      )}
                      {!insight.actionTaken && (
                        <button
                          onClick={() => handleActionTaken(insight._id)}
                          className="btn-primary text-sm"
                        >
                          I've Done This
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 