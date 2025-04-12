import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  ClockIcon,
  BeakerIcon,
  FaceSmileIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [latestLog, setLatestLog] = useState(null);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        try {
          // Attempt to fetch summary data
          const summaryRes = await axios.get('http://localhost:8080/api/health-logs/summary');
          setSummary(summaryRes.data.data);
          setLatestLog(summaryRes.data.data.latestLog);
        } catch (err) {
          console.warn('Could not fetch summary data, using fallback data:', err);
          // Fallback data
          const mockSummary = getMockSummaryData();
          setSummary(mockSummary);
          setLatestLog(mockSummary.latestLog);
        }
        
        try {
          // Attempt to fetch insights
          const insightsRes = await axios.get('http://localhost:8080/api/insights/unread');
          setInsights(insightsRes.data.data);
        } catch (err) {
          console.warn('Could not fetch insights, using fallback data:', err);
          setInsights(getMockInsightsData());
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Mock data for fallback
  const getMockSummaryData = () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    return {
      latestLog: {
        _id: 'mock-log-id',
        user: '1',
        date: new Date(),
        sleep: { hours: 7, quality: 'good' },
        mood: 'good',
        energy: 'moderate',
        water: { glasses: 6 },
        exercise: { didExercise: true, minutes: 30, type: 'walking' },
        nutrition: { meals: 3, junkFood: 1, fruits: 2, vegetables: 3 },
        calculatedScore: 72
      },
      trends: {
        sleep: dates.map((date, i) => ({ date, value: 6 + Math.floor(Math.random() * 3) })),
        mood: dates.map((date, i) => ({ date, value: 3 + Math.floor(Math.random() * 3) })),
        water: dates.map((date, i) => ({ date, value: 5 + Math.floor(Math.random() * 4) })),
        exercise: dates.map((date, i) => ({ date, value: 15 + Math.floor(Math.random() * 30) })),
        scores: dates.map((date, i) => ({ date, value: 65 + Math.floor(Math.random() * 20) }))
      }
    };
  };
  
  const getMockInsightsData = () => {
    return [
      {
        _id: 'mock-insight-1',
        user: '1',
        date: new Date(),
        insightType: 'suggestion',
        title: 'Increase Water Intake',
        description: 'You\'ve been drinking an average of 5 glasses of water daily. Consider increasing to at least 8 glasses.',
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
        date: new Date(),
        insightType: 'pattern',
        title: 'Good Sleep Pattern',
        description: 'You\'ve been maintaining a healthy sleep schedule of 7-8 hours per night. Keep it up!',
        metrics: ['sleep'],
        severity: 'low',
        isRead: false,
        actionTaken: false,
        suggestedActions: [
          'Continue your current bedtime routine',
          'Try to keep consistent sleep and wake times'
        ]
      },
      {
        _id: 'mock-insight-3',
        user: '1',
        date: new Date(),
        insightType: 'alert',
        title: 'High Stress Level',
        description: 'Your tracked stress levels have been increasing. Consider adding relaxation techniques to your daily routine.',
        metrics: ['stress'],
        severity: 'medium',
        isRead: false,
        actionTaken: false,
        suggestedActions: [
          'Try deep breathing exercises',
          'Practice meditation for 10 minutes daily',
          'Take short breaks during work hours'
        ]
      }
    ];
  };

  // Chart data setup
  const getChartData = (metricData, label, borderColor) => {
    if (!metricData || metricData.length === 0) return null;
    
    return {
      labels: metricData.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label,
          data: metricData.map(item => item.value),
          borderColor,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          tension: 0.4,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  // Format the latest log for display
  const formatLatestLog = () => {
    if (!latestLog) return null;
    
    const items = [
      {
        icon: ClockIcon,
        title: 'Sleep',
        value: latestLog.sleep?.hours ? `${latestLog.sleep.hours}h` : 'Not logged',
        color: 'border-blue-500 bg-blue-50',
      },
      {
        icon: BeakerIcon,
        title: 'Water',
        value: latestLog.water?.glasses ? `${latestLog.water.glasses} glasses` : 'Not logged',
        color: 'border-cyan-500 bg-cyan-50',
      },
      {
        icon: FaceSmileIcon,
        title: 'Mood',
        value: latestLog.mood || 'Not logged',
        color: 'border-yellow-500 bg-yellow-50',
      },
      {
        icon: HeartIcon,
        title: 'Exercise',
        value: latestLog.exercise?.didExercise ? `${latestLog.exercise.minutes} min` : 'None',
        color: 'border-red-500 bg-red-50',
      },
    ];
    
    return items;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 animate-pulse-slow">Loading your health dashboard...</p>
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
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
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
            👋 Hello, {user?.name || 'Friend'}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/cam"
            className="btn-primary"
          >
            Log Today's Health
          </Link>
        </div>
      </div>

      {/* Health Score Card */}
      <div className="card mb-6 p-6 bg-gradient-primary text-white">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-md p-3 mb-4 md:mb-0 md:mr-5">
            <span className="text-2xl">🌟</span>
          </div>
          <div className="md:flex md:items-baseline md:justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold text-white truncate">Health Score</h2>
              <div className="text-3xl font-bold">
                {user?.healthScore || 50}/100
              </div>
            </div>
            <div className="mt-2 md:mt-0 md:ml-4 flex items-baseline">
              {user?.healthScore >= 70 ? (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Excellent</span>
              ) : user?.healthScore >= 50 ? (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Good</span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Needs Attention</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Today's Health */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title">Today's Health</h2>
          {latestLog ? (
            <div>
              <div className="grid grid-cols-2 gap-4">
                {formatLatestLog().map((item, index) => (
                  <div key={index} className={`stat-card ${item.color}`}>
                    <div className="p-2 rounded-full mr-4">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{item.title}</div>
                      <div className="text-lg font-semibold">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-4">You haven't logged your health today</p>
              <Link to="/log" className="btn-primary">Log Now</Link>
            </div>
          )}
        </div>

        {/* Recent Trends */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title">Recent Trends</h2>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">Sleep Hours</h3>
              <span className="text-xs text-gray-500">Last 7 days</span>
            </div>
            <div className="h-48">
              {summary?.trends?.sleep && (
                <Line
                  data={getChartData(summary.trends.sleep, 'Sleep Hours', '#3b82f6')}
                  options={chartOptions}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* More Health Trends */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="section-title">Health Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-700">Mood</h3>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>
              <div className="h-48">
                {summary?.trends?.mood && (
                  <Line
                    data={getChartData(summary.trends.mood, 'Mood Level', '#eab308')}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          beginAtZero: true,
                          max: 5,
                          stepSize: 1,
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-700">Water Intake</h3>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>
              <div className="h-48">
                {summary?.trends?.water && (
                  <Line
                    data={getChartData(summary.trends.water, 'Glasses', '#06b6d4')}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="section-title">AI Insights</h2>
          <div className="card p-4 h-full overflow-y-auto custom-scrollbar" style={{ maxHeight: '350px' }}>
            {insights && insights.length > 0 ? (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={insight._id}
                    className={`insight-card ${
                      insight.insightType === 'alert'
                        ? 'border-red-500 bg-red-50'
                        : insight.insightType === 'pattern'
                        ? 'border-blue-500 bg-blue-50'
                        : insight.insightType === 'suggestion'
                        ? 'border-green-500 bg-green-50'
                        : 'border-purple-500 bg-purple-50'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <div className="flex justify-end mt-3">
                      <Link
                        to="/insights"
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link
                    to="/insights"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View All Insights
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-gray-500 mb-2">No insights available yet</p>
                <p className="text-sm text-gray-400">Continue logging your health to receive personalized insights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tip of the day */}
      <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="card p-6 bg-gradient-secondary text-white">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full p-3 mr-4">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-xl">Tip of the Day</h3>
              <p className="mt-2">
                Staying hydrated is crucial for your health. Aim to drink at least 8 glasses of water throughout the day, 
                especially before, during, and after physical activity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 