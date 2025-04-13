import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  LightBulbIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching insights...');
      
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/insights', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Insights response:', res.data);
      
      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to fetch insights');
      }

      if (res.data.data?.insights) {
        console.log('Setting insights:', res.data.data.insights);
        setInsights(res.data.data.insights);
        setLastUpdated(new Date());
      } else if (res.data.data?.message) {
        console.log('No insights message received');
        setInsights([]);
      } else {
        console.log('No insights data available');
        setInsights([]);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load insights');
      setInsights([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'suggestion':
        return <LightBulbIcon className="h-6 w-6 text-yellow-500" />;
      case 'alert':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'pattern':
        return <ChartBarIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <LightBulbIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'suggestion':
        return 'border-yellow-500 bg-yellow-50';
      case 'alert':
        return 'border-red-500 bg-red-50';
      case 'pattern':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 animate-pulse-slow">Analyzing your health data with AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Health Insights</h1>
          <p className="mt-2 text-gray-600">
            Personalized insights powered by Gemini AI
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-primary flex items-center"
        >
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Insights
        </button>
      </div>

      {error && (
        <div className="card p-6 mb-6 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {insights.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <SparklesIcon className="h-16 w-16 text-gray-400 mb-4" />
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
              key={index}
              className={`card p-6 border-l-4 ${getInsightColor(insight.type)} transform transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {insight.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {insight.description}
                  </p>
                  {insight.metrics && insight.metrics.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Key Metrics:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {insight.metrics.map((metric, i) => (
                          <li key={i}>{metric}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insight.suggestedActions && insight.suggestedActions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Suggested Actions:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {insight.suggestedActions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 flex items-center text-sm">
                    <span className="capitalize text-gray-500">{insight.type}</span>
                    {insight.severity && (
                      <span className={`ml-2 capitalize ${getSeverityColor(insight.severity)}`}>
                        • {insight.severity} priority
                      </span>
                    )}
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