import React from 'react';
import PropTypes from 'prop-types';
import { SparklesIcon } from '@heroicons/react/24/outline';

/**
 * TipOfTheDay component displays a daily health tip to the user
 */
export default function TipOfTheDay({ tip, category }) {
  // List of possible categories and their colors
  const categories = {
    nutrition: {
      title: 'Nutrition',
      color: 'green'
    },
    exercise: {
      title: 'Exercise',
      color: 'orange' 
    },
    sleep: {
      title: 'Sleep',
      color: 'blue'
    },
    stress: {
      title: 'Stress Management',
      color: 'purple'
    },
    general: {
      title: 'General Health',
      color: 'primary'
    }
  };
  
  // Get category details, default to general if not found
  const tipCategory = categories[category] || categories.general;
  
  return (
    <div className="card overflow-hidden">
      <div className={`bg-${tipCategory.color}-50 p-4 border-b border-${tipCategory.color}-100`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Tip of the Day</h3>
          <span className={`text-xs font-medium text-${tipCategory.color}-700 bg-${tipCategory.color}-100 px-2 py-1 rounded-full`}>
            {tipCategory.title}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start">
          <div className={`p-2 rounded-full bg-${tipCategory.color}-100 text-${tipCategory.color}-600 mr-3 mt-1`}>
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-gray-700">{tip}</p>
            
            <button className={`mt-4 text-sm text-${tipCategory.color}-600 hover:text-${tipCategory.color}-700 font-medium flex items-center`}>
              Learn more
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Define default tip in case none is provided
const DEFAULT_TIP = "Stay hydrated! Aim to drink at least 8 glasses of water daily to maintain proper hydration, which is essential for overall health.";

TipOfTheDay.propTypes = {
  tip: PropTypes.string,
  category: PropTypes.oneOf(['nutrition', 'exercise', 'sleep', 'stress', 'general'])
};

TipOfTheDay.defaultProps = {
  tip: DEFAULT_TIP,
  category: 'general'
}; 