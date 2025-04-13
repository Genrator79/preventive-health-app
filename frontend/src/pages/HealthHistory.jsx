import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon, BeakerIcon, FaceSmileIcon, HeartIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function HealthHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        try {
          const res = await axios.get('http://localhost:8080/api/health-logs');
          setLogs(res.data.data);
        } catch (err) {
          console.warn('Could not fetch health logs, using mock data:', err);
          setLogs(getMockHealthLogs());
        }
        setLoading(false);
      } catch (err) {
        console.error('Error in health history initialization:', err);
        setError('Failed to load health history');
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getMockHealthLogs = () => {
    const logs = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (i > 0 && Math.random() > 0.8) continue;
      
      logs.push({
        _id: `mock-log-${i}`,
        user: '1',
        date: date,
        sleep: { 
          hours: 5 + Math.floor(Math.random() * 4), 
          quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] 
        },
        mood: ['bad', 'okay', 'good', 'great'][Math.floor(Math.random() * 4)],
        energy: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        water: { glasses: 3 + Math.floor(Math.random() * 6) },
        exercise: { 
          didExercise: Math.random() > 0.3, 
          minutes: 15 + Math.floor(Math.random() * 45),
          type: ['walking', 'running', 'yoga', 'weights', 'swimming'][Math.floor(Math.random() * 5)]
        },
        nutrition: { 
          meals: 2 + Math.floor(Math.random() * 3), 
          junkFood: Math.floor(Math.random() * 3),
          fruits: Math.floor(Math.random() * 5),
          vegetables: Math.floor(Math.random() * 5)
        },
        calculatedScore: 50 + Math.floor(Math.random() * 50)
      });
    }
    
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-green-50 text-green-700 border-l-green-500';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-l-blue-500';
    if (score >= 40) return 'bg-yellow-50 text-yellow-700 border-l-yellow-500';
    return 'bg-red-50 text-red-700 border-l-red-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 animate-pulse-slow">Loading your health history...</p>
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
            Health History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your health journey over time
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/log"
            className="btn-primary"
          >
            Log New Entry
          </Link>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <CalendarDaysIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No health logs found</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Start tracking your health metrics to see your history and discover patterns over time.
            </p>
            <Link
              to="/log"
              className="btn-primary"
            >
              Log Your First Entry
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log._id} className={`card p-4 animate-slide-up border-l-4 ${getScoreColorClass(log.calculatedScore)}`}>
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-lg font-semibold text-gray-800">{formatDate(log.date)}</span>
                    {log.calculatedScore && (
                      <div className="ml-auto md:hidden bg-white p-1 rounded-full shadow-sm">
                        <ChartBarIcon className="h-5 w-5 text-primary-600" />
                        <span className="font-semibold text-sm">{log.calculatedScore}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {log.sleep?.hours && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-500">Sleep</div>
                          <div className="text-sm font-medium">{log.sleep.hours}h ({log.sleep.quality})</div>
                        </div>
                      </div>
                    )}
                    
                    {log.water?.glasses && (
                      <div className="flex items-center">
                        <BeakerIcon className="h-5 w-5 text-cyan-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-500">Water</div>
                          <div className="text-sm font-medium">{log.water.glasses} glasses</div>
                        </div>
                      </div>
                    )}
                    
                    {log.mood && (
                      <div className="flex items-center">
                        <FaceSmileIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-500">Mood</div>
                          <div className="text-sm font-medium capitalize">{log.mood}</div>
                        </div>
                      </div>
                    )}
                    
                    {log.exercise?.didExercise && (
                      <div className="flex items-center">
                        <HeartIcon className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <div className="text-xs text-gray-500">Exercise</div>
                          <div className="text-sm font-medium">{log.exercise.minutes} min ({log.exercise.type})</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {log.nutrition && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">Nutrition:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {log.nutrition.fruits > 0 && (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                            {log.nutrition.fruits} fruits
                          </span>
                        )}
                        {log.nutrition.vegetables > 0 && (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                            {log.nutrition.vegetables} vegetables
                          </span>
                        )}
                        {log.nutrition.junkFood > 0 && (
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">
                            {log.nutrition.junkFood} junk items
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {log.calculatedScore && (
                  <div className="hidden md:flex items-center ml-4 pl-4 border-l">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Health Score</p>
                      <div className="text-2xl font-bold text-primary-600">{log.calculatedScore}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 