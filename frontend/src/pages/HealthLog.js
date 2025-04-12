import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function HealthLog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
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
          minutes: formData.exercise.minutes ? Number(formData.exercise.minutes) : undefined
        },
        nutrition: {
          ...formData.nutrition,
          meals: formData.nutrition.meals ? Number(formData.nutrition.meals) : undefined,
          junkFood: formData.nutrition.junkFood ? Number(formData.nutrition.junkFood) : undefined,
          fruits: formData.nutrition.fruits ? Number(formData.nutrition.fruits) : undefined,
          vegetables: formData.nutrition.vegetables ? Number(formData.nutrition.vegetables) : undefined
        }
      };
      
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
      
      await axios.post('/api/health-logs', payload);
      setSuccess(true);
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
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
    <div className="container mx-auto px-4 py-8">
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

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sleep Section */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Sleep</h3>
                <p className="mt-1 text-sm text-gray-500">
                  How well did you sleep last night?
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="sleep.hours" className="block text-sm font-medium text-gray-700">
                      Hours of Sleep
                    </label>
                    <input
                      type="number"
                      name="sleep.hours"
                      id="sleep.hours"
                      min="0"
                      max="24"
                      step="0.5"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.sleep.hours}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="sleep.quality" className="block text-sm font-medium text-gray-700">
                      Sleep Quality
                    </label>
                    <select
                      id="sleep.quality"
                      name="sleep.quality"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.sleep.quality}
                      onChange={handleChange}
                    >
                      <option value="">Select quality</option>
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood & Energy Section */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Mood & Energy</h3>
                <p className="mt-1 text-sm text-gray-500">
                  How are you feeling today?
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
                      Mood
                    </label>
                    <select
                      id="mood"
                      name="mood"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.mood}
                      onChange={handleChange}
                    >
                      <option value="">Select mood</option>
                      <option value="terrible">Terrible</option>
                      <option value="bad">Bad</option>
                      <option value="neutral">Neutral</option>
                      <option value="good">Good</option>
                      <option value="great">Great</option>
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="energy" className="block text-sm font-medium text-gray-700">
                      Energy Level
                    </label>
                    <select
                      id="energy"
                      name="energy"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.energy}
                      onChange={handleChange}
                    >
                      <option value="">Select energy level</option>
                      <option value="very low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="very high">Very High</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Water & Exercise Section */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Hydration & Activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Track your water intake and physical activity
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="water.glasses" className="block text-sm font-medium text-gray-700">
                      Glasses of Water
                    </label>
                    <input
                      type="number"
                      name="water.glasses"
                      id="water.glasses"
                      min="0"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.water.glasses}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="exercise.didExercise"
                          name="exercise.didExercise"
                          type="checkbox"
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={formData.exercise.didExercise}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="exercise.didExercise" className="font-medium text-gray-700">
                          Did you exercise today?
                        </label>
                      </div>
                    </div>
                  </div>
                  {formData.exercise.didExercise && (
                    <>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="exercise.minutes" className="block text-sm font-medium text-gray-700">
                          Minutes of Exercise
                        </label>
                        <input
                          type="number"
                          name="exercise.minutes"
                          id="exercise.minutes"
                          min="0"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.exercise.minutes}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="exercise.type" className="block text-sm font-medium text-gray-700">
                          Type of Exercise
                        </label>
                        <input
                          type="text"
                          name="exercise.type"
                          id="exercise.type"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={formData.exercise.type}
                          onChange={handleChange}
                          placeholder="e.g., walking, running, yoga"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Section */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Nutrition</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Log your food intake for the day
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="nutrition.meals" className="block text-sm font-medium text-gray-700">
                      Number of Meals
                    </label>
                    <input
                      type="number"
                      name="nutrition.meals"
                      id="nutrition.meals"
                      min="0"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.nutrition.meals}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="nutrition.junkFood" className="block text-sm font-medium text-gray-700">
                      Processed/Junk Food Servings
                    </label>
                    <input
                      type="number"
                      name="nutrition.junkFood"
                      id="nutrition.junkFood"
                      min="0"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.nutrition.junkFood}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="nutrition.fruits" className="block text-sm font-medium text-gray-700">
                      Fruit Servings
                    </label>
                    <input
                      type="number"
                      name="nutrition.fruits"
                      id="nutrition.fruits"
                      min="0"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.nutrition.fruits}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="nutrition.vegetables" className="block text-sm font-medium text-gray-700">
                      Vegetable Servings
                    </label>
                    <input
                      type="number"
                      name="nutrition.vegetables"
                      id="nutrition.vegetables"
                      min="0"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.nutrition.vegetables}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Symptoms</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Record any symptoms you're experiencing
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                {/* Existing symptoms */}
                {formData.symptoms.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recorded Symptoms:</h4>
                    <ul className="divide-y divide-gray-200">
                      {formData.symptoms.map((symptom, index) => (
                        <li key={index} className="py-3 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{symptom.name}</p>
                            <p className="text-sm text-gray-500">
                              Severity: {symptom.severity}
                              {symptom.notes && ` - Note: ${symptom.notes}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="ml-2 text-red-600 hover:text-red-900"
                            onClick={() => removeSymptom(index)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Add new symptom form */}
                <div className="border-t border-gray-200 pt-5">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="symptom-name" className="block text-sm font-medium text-gray-700">
                        Symptom Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="symptom-name"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={newSymptom.name}
                        onChange={handleSymptomChange}
                        placeholder="e.g., headache, fatigue, etc."
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="symptom-severity" className="block text-sm font-medium text-gray-700">
                        Severity
                      </label>
                      <select
                        id="symptom-severity"
                        name="severity"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={newSymptom.severity}
                        onChange={handleSymptomChange}
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="symptom-notes" className="block text-sm font-medium text-gray-700">
                        Notes (optional)
                      </label>
                      <input
                        type="text"
                        name="notes"
                        id="symptom-notes"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={newSymptom.notes}
                        onChange={handleSymptomChange}
                        placeholder="Any additional details about this symptom"
                      />
                    </div>
                    <div className="col-span-6">
                      <button
                        type="button"
                        onClick={addSymptom}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add Symptom
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Notes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Anything else you'd like to record?
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="mt-1 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional information about your health today"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
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
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? 'Saving...' : 'Save Health Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 