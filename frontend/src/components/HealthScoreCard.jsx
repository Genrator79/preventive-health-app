import React from 'react';
import PropTypes from 'prop-types';
import { HeartIcon } from '@heroicons/react/24/solid';

/**
 * HealthScoreCard component displays the user's overall health score with a visual gauge
 */
export default function HealthScoreCard({ score, previousScore }) {
  // Calculate the percentage for the visual gauge
  const percentage = score || 0;
  const scoreChange = previousScore ? score - previousScore : 0;
  
  // Determine score color based on value
  const getScoreColorClass = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 65) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Determine score background color
  const getScoreBgClass = () => {
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 65) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };
  
  // Get trend indicator
  const getTrendIndicator = () => {
    if (scoreChange > 0) {
      return (
        <span className="text-green-600 ml-2 flex items-center text-sm">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V7z" clipRule="evenodd" />
          </svg>
          {scoreChange.toFixed(1)}
        </span>
      );
    } else if (scoreChange < 0) {
      return (
        <span className="text-red-600 ml-2 flex items-center text-sm">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 10-2 0v-5.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L12 7.414V13z" clipRule="evenodd" />
          </svg>
          {Math.abs(scoreChange).toFixed(1)}
        </span>
      );
    }
    return null;
  };
  
  // Get score description based on value
  const getScoreDescription = () => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 65) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Needs improvement';
  };

  return (
    <div className="card overflow-hidden">
      <div className={`bg-gradient-to-r ${getScoreBgClass()} p-4 text-white`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Health Score</h3>
          <HeartIcon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-baseline mb-2">
          <span className={`text-3xl font-bold ${getScoreColorClass()}`}>
            {score || 0}
          </span>
          <span className="text-gray-500 text-sm ml-1">/100</span>
          {getTrendIndicator()}
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{getScoreDescription()}</p>
        
        {/* Visual gauge */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className={`h-2.5 rounded-full bg-gradient-to-r ${getScoreBgClass()}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

HealthScoreCard.propTypes = {
  score: PropTypes.number.isRequired,
  previousScore: PropTypes.number
}; 