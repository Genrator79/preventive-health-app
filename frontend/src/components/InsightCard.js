import React from 'react';
import PropTypes from 'prop-types';
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

/**
 * InsightCard component for displaying health insights with actions
 */
export default function InsightCard({ 
  insight, 
  onMarkAsRead, 
  onActionTaken 
}) {
  const { 
    _id, 
    insightType, 
    title, 
    description, 
    metrics = [], 
    severity, 
    suggestedActions = [], 
    isRead, 
    actionTaken 
  } = insight;

  // Configure card appearance based on insight type
  const getCardConfig = () => {
    switch (insightType) {
      case 'alert':
        return {
          icon: <ExclamationTriangleIcon className="h-6 w-6" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-700'
        };
      case 'pattern':
        return {
          icon: <ChartBarIcon className="h-6 w-6" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-700'
        };
      case 'achievement':
        return {
          icon: <CheckCircleIcon className="h-6 w-6" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-700'
        };
      case 'suggestion':
      default:
        return {
          icon: <LightBulbIcon className="h-6 w-6" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-700'
        };
    }
  };

  const config = getCardConfig();

  return (
    <div className={`insight-card ${config.bgColor} ${config.borderColor} ${isRead ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className={`rounded-full p-2 mr-3 ${config.bgColor} ${config.textColor}`}>
            {config.icon}
          </div>
          <div>
            <div className="flex items-center">
              <h3 className={`font-semibold ${config.textColor}`}>
                {title}
              </h3>
              {isRead && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  Read
                </span>
              )}
              {actionTaken && (
                <span className="ml-2 text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full">
                  Action Taken
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
            
            {metrics.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Related metrics:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {metrics.map((metric, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-white text-gray-700 px-2 py-0.5 rounded-full"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {suggestedActions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700">Suggested actions:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1 ml-1">
                  {suggestedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        {!isRead && (
          <button 
            onClick={() => onMarkAsRead(_id)} 
            className="text-xs bg-white hover:bg-gray-100 text-gray-700 font-medium py-1 px-3 rounded border border-gray-300"
          >
            Mark as read
          </button>
        )}
        {!actionTaken && (
          <button 
            onClick={() => onActionTaken(_id)} 
            className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-medium py-1 px-3 rounded"
          >
            I've taken action
          </button>
        )}
      </div>
    </div>
  );
}

InsightCard.propTypes = {
  insight: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    insightType: PropTypes.oneOf(['alert', 'pattern', 'suggestion', 'achievement']).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    metrics: PropTypes.arrayOf(PropTypes.string),
    severity: PropTypes.oneOf(['low', 'medium', 'high']),
    suggestedActions: PropTypes.arrayOf(PropTypes.string),
    isRead: PropTypes.bool,
    actionTaken: PropTypes.bool
  }).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onActionTaken: PropTypes.func.isRequired
}; 