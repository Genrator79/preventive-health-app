import React from 'react';
import PropTypes from 'prop-types';
import {
  ClockIcon,
  BeakerIcon,
  FaceSmileIcon,
  HeartIcon,
  BoltIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

export default function HealthMetricsCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend,
  unit, 
  description,
  onClick 
}) {
 
  const IconComponent = () => {
    switch (icon) {
      case 'sleep':
        return <ClockIcon className="h-6 w-6" />;
      case 'water':
        return <BeakerIcon className="h-6 w-6" />;
      case 'mood':
        return <FaceSmileIcon className="h-6 w-6" />;
      case 'heart':
        return <HeartIcon className="h-6 w-6" />;
      case 'energy':
        return <BoltIcon className="h-6 w-6" />;
      case 'exercise':
        return <FireIcon className="h-6 w-6" />;
      default:
        return <HeartIcon className="h-6 w-6" />;
    }
  };
  
  const borderColorClass = `border-${color || 'primary'}-500`;
  

  const renderTrend = () => {
    if (!trend) return null;
    
    if (trend === 'up') {
      return <span className="text-green-500 text-sm">↑</span>;
    } else if (trend === 'down') {
      return <span className="text-red-500 text-sm">↓</span>;
    } else {
      return <span className="text-gray-400 text-sm">→</span>;
    }
  };

  return (
    <div 
      className={`stat-card ${borderColorClass} cursor-pointer hover:translate-x-1`}
      onClick={onClick}
    >
      <div className={`rounded-full p-2 mr-4 bg-${color || 'primary'}-100 text-${color || 'primary'}-600`}>
        <IconComponent />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">
          {title}
        </h3>
        <div className="flex items-baseline">
          <p className="text-xl font-semibold">
            {value}
            {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
          </p>
          {renderTrend()}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

HealthMetricsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.oneOf(['sleep', 'water', 'mood', 'heart', 'energy', 'exercise']),
  color: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  unit: PropTypes.string,
  description: PropTypes.string,
  onClick: PropTypes.func
};

HealthMetricsCard.defaultProps = {
  icon: 'heart',
  color: 'primary',
  onClick: () => {}
}; 