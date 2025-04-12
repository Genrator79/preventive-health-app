import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MoonIcon, SunIcon, BeakerIcon, HeartIcon, FaceSmileIcon } from '@heroicons/react/24/outline';

export default function HealthLog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const [formData, setFormData] = useState({
    sleep: {
      hours: '',
      quality: ''
    },
    mood: '',
    energy: '',
    water: {
      glasses: ''
    },
    exercise: {
      didExercise: false,
      minutes: '',
      type: ''
    },
    nutrition: {
      meals: '',
      junkFood: '',
      fruits: '',
      vegetables: ''
    },
    symptoms: [],
    notes: ''
  });

  const [newSymptom, setNewSymptom] = useState({
    name: '',
    severity: 'mild',
    notes: ''
  });

  // Handle general form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle symptom form
  const handleSymptomChange = (e) => {
    const { name, value } = e.target;
    setNewSymptom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add symptom to list
  const addSymptom = (e) => {
    e.preventDefault();
    if (!newSymptom.name) return;
    
    setFormData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, { ...newSymptom }]
    }));
    
    setNewSymptom({
      name: '',
      severity: 'mild',
      notes: ''
    });
  };

  // Remove symptom from list
  const removeSymptom = (index) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  // Helper function to get sleep quality color
  const getSleepQualityColor = (quality) => {
    switch (quality) {
      case 'poor': return 'bg-red-500';
      case 'fair': return 'bg-yellow-500';
      case 'good': return 'bg-green-500';
      case 'excellent': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  // Add this function at the beginning of the component
  const getSleepQualityMessage = (hours) => {
    if (hours === 0) return 'Enter your sleep duration';
    if (hours < 5) return 'You may not be getting enough sleep for optimal health';
    if (hours >= 5 && hours < 7) return 'Getting closer to the recommended amount of sleep';
    if (hours >= 7 && hours <= 9) return 'Great! You\'re in the optimal sleep range';
    return 'You might be oversleeping, which can affect your energy levels';
  };

  // Calculate form completion percentage
  useEffect(() => {
    let fieldsCompleted = 0;
    let totalFields = 8; // Total main sections to track
  
    // Sleep section (counts as 1 if either field is filled)
    if (formData.sleep.hours || formData.sleep.quality) fieldsCompleted += 1;
    
    // Mood
    if (formData.mood) fieldsCompleted += 1;
    
    // Energy
    if (formData.energy) fieldsCompleted += 1;
    
    // Water
    if (formData.water.glasses) fieldsCompleted += 1;
    
    // Exercise (counts if they marked whether they exercised)
    fieldsCompleted += 1; // This is always completed since it's a yes/no toggle
    
    // Nutrition (counts as 1 if any nutrition field is filled)
    if (formData.nutrition.meals || formData.nutrition.junkFood || 
        formData.nutrition.fruits || formData.nutrition.vegetables) {
      fieldsCompleted += 1;
    }
    
    // Symptoms (counts as completed if they either added a symptom or implicitly indicated no symptoms)
    fieldsCompleted += 1; // This is always completed as it's implicit
    
    // Notes (optional, doesn't count towards completion)
    if (formData.notes) fieldsCompleted += 0.5; // Bonus for adding notes
    
    // Calculate percentage
    setCompletionPercentage(Math.min(100, Math.round((fieldsCompleted / totalFields) * 100)));
  }, [formData]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Handle the "other" exercise type if selected
      let exerciseType = formData.exercise.type;
      if (formData.exercise.type === 'other' && formData.exercise.typeOther) {
        exerciseType = formData.exercise.typeOther;
      }
      
      // Convert string inputs to numbers where needed
      const payload = {
        ...formData,
        sleep: {
          ...formData.sleep,
          hours: formData.sleep.hours ? Number(formData.sleep.hours) : undefined
        },
        water: {
          ...formData.water,
          glasses: formData.water.glasses ? Number(formData.water.glasses) : undefined
        },
        exercise: {
          ...formData.exercise,
          minutes: formData.exercise.minutes ? Number(formData.exercise.minutes) : undefined,
          type: exerciseType
        },
        nutrition: {
          ...formData.nutrition,
          meals: formData.nutrition.meals ? Number(formData.nutrition.meals) : undefined,
          junkFood: formData.nutrition.junkFood ? Number(formData.nutrition.junkFood) : undefined,
          fruits: formData.nutrition.fruits ? Number(formData.nutrition.fruits) : undefined,
          vegetables: formData.nutrition.vegetables ? Number(formData.nutrition.vegetables) : undefined
        }
      };
      
      // Clean up temporary fields that shouldn't be sent to the API
      if (payload.exercise.typeOther) delete payload.exercise.typeOther;
      
      // Remove empty fields to prevent validation errors
      if (!payload.sleep.hours) delete payload.sleep.hours;
      if (!payload.sleep.quality) delete payload.sleep.quality;
      if (!payload.mood) delete payload.mood;
      if (!payload.energy) delete payload.energy;
      if (!payload.water.glasses) delete payload.water.glasses;
      if (!payload.exercise.minutes) delete payload.exercise.minutes;
      if (!payload.exercise.type) delete payload.exercise.type;
      if (!payload.nutrition.meals) delete payload.nutrition.meals;
      if (!payload.nutrition.junkFood) delete payload.nutrition.junkFood;
      if (!payload.nutrition.fruits) delete payload.nutrition.fruits;
      if (!payload.nutrition.vegetables) delete payload.nutrition.vegetables;
      if (!payload.notes) delete payload.notes;
      
      // Log the payload for debugging
      console.log('Submitting health log:', payload);
      
      try {
        await axios.post('/api/health-logs', payload);
        setSuccess(true);
        
        // Redirect to dashboard after successful submission
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err) {
        // Fallback to direct API endpoint if the relative URL fails
        console.log('Retrying with absolute URL');
        await axios.post('http://localhost:5001/api/health-logs', payload);
        setSuccess(true);
        
        // Redirect to dashboard after successful submission
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting health log:', err);
      setError(err.response?.data?.message || 'Failed to save health log');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your health log has been saved.</span>
            <p className="mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Log Your Health
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your daily health metrics to get personalized insights
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Form completion</span>
            <span className="text-sm font-medium text-primary-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500 text-right">
            {completionPercentage === 100 ? 
              <span className="text-green-600 font-medium">All set! Ready to save your health log.</span> : 
              <span>Fill in the form to track your health</span>
            }
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sleep Section */}
          <div className="card p-6 transition-all duration-300 hover:shadow-md health-log-card">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <MoonIcon className="h-6 w-6 mr-2 text-primary-600" />
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Sleep</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  How well did you sleep last night?
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="sleep.hours" className="block text-sm font-medium text-gray-700 mb-1">
                      Hours of Sleep: <span className="text-primary-600 font-semibold transition-all duration-300">{formData.sleep.hours || 0}</span>
                    </label>
                    <div className="flex items-center">
                      <MoonIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          name="sleep.hours"
                          id="sleep.hours"
                          min="0"
                          max="12"
                          step="0.5"
                          className="health-slider z-10 relative w-full"
                          value={formData.sleep.hours || 0}
                          onChange={handleChange}
                        />
                        <div 
                          className="absolute top-1/2 h-3 rounded-lg transition-all duration-300 ease-out z-0" 
                          style={{ 
                            width: `${((formData.sleep.hours || 0) / 12) * 100}%`,
                            left: 0,
                            transform: 'translateY(-50%)',
                            background: `linear-gradient(to right, 
                              ${(formData.sleep.hours || 0) < 5 ? 'var(--primary-400)' : 'var(--primary-600)'},
                              ${(formData.sleep.hours || 0) > 9 ? 'var(--secondary-400)' : 'var(--primary-400)'}
                            )`,
                            opacity: 0.3
                          }}
                        ></div>
                      </div>
                      <SunIcon className="h-5 w-5 text-yellow-500 ml-2" />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span className={`${(formData.sleep.hours || 0) >= 6 && (formData.sleep.hours || 0) <= 8 ? 'text-primary-600 font-semibold' : ''}`}>
                        Optimal
                      </span>
                      <span>High</span>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500 animate-fade-in" style={{ minHeight: '1.5rem' }}>
                      {getSleepQualityMessage(formData.sleep.hours || 0)}
                    </div>
                  </div>
                  
                  <div className="col-span-6">
                    <label htmlFor="sleep.quality" className="block text-sm font-medium text-gray-700 mb-1">
                      Sleep Quality
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['poor', 'fair', 'good', 'excellent'].map((quality) => (
                        <button
                          key={quality}
                          type="button"
                          className={`mood-button ${
                            formData.sleep.quality === quality
                              ? `${getSleepQualityColor(quality)} text-white active`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200`}
                          onClick={() => setFormData({
                            ...formData,
                            sleep: { ...formData.sleep, quality }
                          })}
                        >
                          {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood & Energy Section */}
          <div className="card p-6 transition-all duration-300 hover:shadow-md">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <FaceSmileIcon className="h-6 w-6 mr-2 text-yellow-500" />
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Mood & Energy</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  How are you feeling today?
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mood
                    </label>
                    <div className="flex flex-wrap gap-2 justify-between">
                      {[
                        { value: 'terrible', emoji: '😣', label: 'Terrible', color: 'bg-red-500' },
                        { value: 'bad', emoji: '😟', label: 'Bad', color: 'bg-orange-500' },
                        { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
                        { value: 'good', emoji: '🙂', label: 'Good', color: 'bg-green-500' },
                        { value: 'great', emoji: '😄', label: 'Great', color: 'bg-blue-500' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 mood-button ${
                            formData.mood === option.value 
                              ? `${option.color} text-white transform scale-110` 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                          onClick={() => {
                            // Add a slight delay to make the animation more noticeable
                            const btn = document.activeElement;
                            if (btn) btn.blur();
                            
                            // Update the form data
                            setFormData({ ...formData, mood: option.value });
                          }}
                        >
                          <span className="text-2xl mb-1" style={{ transition: 'transform 0.3s ease', transform: formData.mood === option.value ? 'scale(1.2)' : 'scale(1)' }}>
                            {option.emoji}
                          </span>
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy Level
                    </label>
                    <div className="h-14 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg"></div>
                      <input
                        type="range"
                        name="energy"
                        id="energy-range"
                        min="0"
                        max="4"
                        step="1"
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        value={
                          formData.energy === 'very low' ? 0 :
                          formData.energy === 'low' ? 1 :
                          formData.energy === 'moderate' ? 2 :
                          formData.energy === 'high' ? 3 :
                          formData.energy === 'very high' ? 4 : 2
                        }
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const energyValue = 
                            val === 0 ? 'very low' :
                            val === 1 ? 'low' :
                            val === 2 ? 'moderate' :
                            val === 3 ? 'high' : 'very high';
                            
                          setFormData({ ...formData, energy: energyValue });
                        }}
                      />
                      <div 
                        className="absolute top-0 left-0 w-11 h-14 bg-white rounded-lg shadow-lg transform -translate-x-1/2 flex items-center justify-center"
                        style={{ 
                          left: `${
                            formData.energy === 'very low' ? 0 :
                            formData.energy === 'low' ? 25 :
                            formData.energy === 'moderate' ? 50 :
                            formData.energy === 'high' ? 75 :
                            formData.energy === 'very high' ? 100 : 50
                          }%` 
                        }}
                      >
                        <span className="font-medium text-xs">
                          {formData.energy || 'Select'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Very Low</span>
                      <span>Low</span>
                      <span>Moderate</span>
                      <span>High</span>
                      <span>Very High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Water & Exercise Section */}
          <div className="card p-6 transition-all duration-300 hover:shadow-md">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <BeakerIcon className="h-6 w-6 mr-2 text-blue-500" />
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Hydration & Activity</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Track your water intake and physical activity
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Glasses of Water
                    </label>
                    <div className="flex flex-wrap gap-2 water-counter">
                      {[...Array(10)].map((_, i) => {
                        const isActive = formData.water.glasses >= i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isActive 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                            style={{ 
                              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              transform: isActive ? 'scale(1.05)' : 'scale(1)',
                              boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                            }}
                            onClick={() => {
                              // Set with animation if increasing
                              if (i + 1 > formData.water.glasses) {
                                // Add animation class temporarily
                                const btn = document.activeElement;
                                if (btn) {
                                  btn.classList.add('water-drop');
                                  setTimeout(() => {
                                    btn.classList.remove('water-drop');
                                  }, 600); // Animation duration
                                }
                              }
                              
                              setFormData({
                                ...formData,
                                water: { ...formData.water, glasses: i + 1 }
                              });
                            }}
                          >
                            <span className="text-lg" style={{ 
                              opacity: isActive ? '1' : '0.5',
                              transition: 'opacity 0.3s ease'
                            }}>💧</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-sm text-gray-500 animate-fade-in" style={{ minHeight: '1.5rem' }}>
                      {formData.water.glasses ? `${formData.water.glasses} glass${formData.water.glasses > 1 ? 'es' : ''} of water` : 'No water logged yet'}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-5">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Exercise
                      </label>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          name="exercise.didExercise"
                          id="exercise.didExercise"
                          checked={formData.exercise.didExercise}
                          onChange={handleChange}
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                          htmlFor="exercise.didExercise"
                          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            formData.exercise.didExercise ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        ></label>
                      </div>
                    </div>
                    
                    <style jsx>{`
                      .toggle-checkbox:checked {
                        right: 0;
                        border-color: #10B981;
                      }
                      .toggle-checkbox:checked + .toggle-label {
                        background-color: #10B981;
                      }
                      .toggle-label {
                        transition: background-color 0.2s ease;
                      }
                    `}</style>
                    
                    {formData.exercise.didExercise && (
                      <div className="mt-4 space-y-4 animate-fade-in">
                        <div>
                          <label htmlFor="exercise.minutes" className="block text-sm font-medium text-gray-700 mb-1">
                            Minutes of Exercise: {formData.exercise.minutes || 0}
                          </label>
                          <div className="relative">
                            <input
                              type="range"
                              name="exercise.minutes"
                              id="exercise.minutes"
                              min="0"
                              max="180"
                              step="5"
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              value={formData.exercise.minutes || 0}
                              onChange={handleChange}
                            />
                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                              <span>0 min</span>
                              <span>30 min</span>
                              <span>60 min</span>
                              <span>90 min</span>
                              <span>120+ min</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type of Exercise
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["walking", "running", "cycling", "swimming", "yoga", "strength", "other"].map((type) => (
                              <button
                                key={type}
                                type="button"
                                className={`py-2 px-3 rounded-md text-sm capitalize transition-colors duration-200 ${
                                  formData.exercise.type === type
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => setFormData({
                                  ...formData,
                                  exercise: { ...formData.exercise, type }
                                })}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                          {formData.exercise.type === 'other' && (
                            <input
                              type="text"
                              placeholder="Specify exercise type"
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              value={formData.exercise.typeOther || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                exercise: { ...formData.exercise, typeOther: e.target.value }
                              })}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Section */}
          <div className="card p-6 transition-all duration-300 hover:shadow-md">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Nutrition</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Log your food intake for the day
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meals Eaten Today
                    </label>
                    <div className="flex space-x-4">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                            formData.nutrition.meals === num
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => setFormData({
                            ...formData,
                            nutrition: { ...formData.nutrition, meals: num }
                          })}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fruit Servings 🍎
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 counter-button"
                          onClick={() => {
                            if (formData.nutrition.fruits > 0) {
                              setFormData({
                                ...formData,
                                nutrition: { ...formData.nutrition, fruits: formData.nutrition.fruits - 1 }
                              });
                            }
                          }}
                        >
                          <span>-</span>
                        </button>
                        <div className="w-16 text-center">
                          <span className="text-lg font-medium">{formData.nutrition.fruits || 0}</span>
                        </div>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 text-green-800 counter-button"
                          onClick={() => setFormData({
                            ...formData,
                            nutrition: { ...formData.nutrition, fruits: (formData.nutrition.fruits || 0) + 1 }
                          })}
                        >
                          <span>+</span>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vegetable Servings 🥦
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 counter-button"
                          onClick={() => {
                            if (formData.nutrition.vegetables > 0) {
                              setFormData({
                                ...formData,
                                nutrition: { ...formData.nutrition, vegetables: formData.nutrition.vegetables - 1 }
                              });
                            }
                          }}
                        >
                          <span>-</span>
                        </button>
                        <div className="w-16 text-center">
                          <span className="text-lg font-medium">{formData.nutrition.vegetables || 0}</span>
                        </div>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 text-green-800 counter-button"
                          onClick={() => setFormData({
                            ...formData,
                            nutrition: { ...formData.nutrition, vegetables: (formData.nutrition.vegetables || 0) + 1 }
                          })}
                        >
                          <span>+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processed/Junk Food Servings 🍔
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        onClick={() => {
                          if (formData.nutrition.junkFood > 0) {
                            setFormData({
                              ...formData,
                              nutrition: { ...formData.nutrition, junkFood: formData.nutrition.junkFood - 1 }
                            });
                          }
                        }}
                      >
                        <span>-</span>
                      </button>
                      <div className="w-16 text-center">
                        <span className="text-lg font-medium">{formData.nutrition.junkFood || 0}</span>
                      </div>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-800"
                        onClick={() => setFormData({
                          ...formData,
                          nutrition: { ...formData.nutrition, junkFood: (formData.nutrition.junkFood || 0) + 1 }
                        })}
                      >
                        <span>+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="card p-6 transition-all duration-300 hover:shadow-md health-log-card">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Symptoms</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Record any symptoms you're experiencing
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                {/* Existing symptoms */}
                <div className="relative">
                  {formData.symptoms.length > 0 ? (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <span>Recorded Symptoms</span>
                        <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {formData.symptoms.length}
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {formData.symptoms.map((symptom, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-4 rounded-lg bg-white border border-gray-200 shadow-sm animate-slide-up hover:shadow-md transition-all duration-300"
                            style={{ 
                              animationDelay: `${index * 50}ms`,
                              borderLeft: `4px solid ${
                                symptom.severity === 'mild' ? '#EAB308' :
                                symptom.severity === 'moderate' ? '#F97316' : '#EF4444'
                              }`
                            }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900">{symptom.name}</span>
                                <span className={`ml-2 px-2.5 py-0.5 text-xs rounded-full ${
                                  symptom.severity === 'mild' ? 'bg-yellow-100 text-yellow-800' :
                                  symptom.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {symptom.severity}
                                </span>
                              </div>
                              {symptom.notes && (
                                <div className="mt-1.5 text-sm text-gray-500 flex items-start">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  <p>{symptom.notes}</p>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className="ml-4 p-1.5 rounded-full text-red-600 hover:bg-red-100 focus:outline-none transition-colors duration-200"
                              onClick={() => removeSymptom(index)}
                              aria-label="Remove symptom"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 mb-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No symptoms recorded</h3>
                        <p className="mt-1 text-sm text-gray-500 max-w-md">
                          Add any symptoms you're experiencing below
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add new symptom form */}
                <div className={`border-t border-gray-200 pt-5 ${formData.symptoms.length > 0 ? 'animate-fade-in' : ''}`}>
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="symptom-name" className="block text-sm font-medium text-gray-700">
                        Symptom Name
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="name"
                          id="symptom-name"
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md py-2 pl-10"
                          value={newSymptom.name}
                          onChange={handleSymptomChange}
                          placeholder="e.g., headache, fatigue, etc."
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="symptom-severity" className="block text-sm font-medium text-gray-700">
                        Severity
                      </label>
                      <div className="mt-1 flex space-x-2">
                        {[
                          { value: 'mild', label: 'Mild', color: 'bg-yellow-500' },
                          { value: 'moderate', label: 'Moderate', color: 'bg-orange-500' },
                          { value: 'severe', label: 'Severe', color: 'bg-red-500' }
                        ].map((severity) => (
                          <button
                            key={severity.value}
                            type="button"
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                              newSymptom.severity === severity.value
                                ? `${severity.color} text-white transform scale-105 shadow-md`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setNewSymptom({
                              ...newSymptom,
                              severity: severity.value
                            })}
                          >
                            {severity.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="symptom-notes" className="block text-sm font-medium text-gray-700">
                        Notes (optional)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <textarea
                          name="notes"
                          id="symptom-notes"
                          rows={2}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md py-2 pl-10"
                          value={newSymptom.notes}
                          onChange={handleSymptomChange}
                          placeholder="Any additional details about this symptom"
                        />
                        <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6">
                      <button
                        type="button"
                        onClick={addSymptom}
                        disabled={!newSymptom.name}
                        className={`inline-flex items-center px-4 py-2.5 rounded-md shadow-sm text-sm font-medium transition-all duration-200 ${
                          newSymptom.name
                            ? 'bg-primary-600 hover:bg-primary-700 text-white transform hover:scale-105'
                            : 'bg-gray-300 cursor-not-allowed text-gray-500'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Add Symptom
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="card p-6 transition-all duration-300 hover:shadow-md health-log-card">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Notes</h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Anything else you'd like to record?
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Journal Your Thoughts
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md py-2 pl-10 transition-all duration-200"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="How are you feeling overall? Any additional information about your health today?"
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          These notes are private and only visible to you
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formData.notes ? `${formData.notes.length} characters` : 'No notes added'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-blue-700">
                          Regular journaling about your health can help you identify patterns and triggers over time.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {formData.notes && formData.notes.length > 10 && (
                    <div className="text-right">
                      <span className="inline-flex items-center text-sm text-primary-600">
                        <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Notes saved
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="relative inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 group overflow-hidden btn-bounce"
            >
              <span className="relative z-10">{loading ? 'Saving...' : 'Save Health Log'}</span>
              <span className="absolute inset-0 h-full w-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 