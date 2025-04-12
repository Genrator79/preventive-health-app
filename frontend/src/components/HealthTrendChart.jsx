import React from 'react';
import PropTypes from 'prop-types';
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

/**
 * HealthTrendChart component displays a line chart for a health metric over time
 */
export default function HealthTrendChart({ 
  title, 
  data, 
  color = 'rgb(14, 165, 233)', 
  label = 'Value',
  unit = '',
  height = 200
}) {
  // Format dates for x-axis
  const formatDateLabels = (rawData) => {
    if (!rawData || !rawData.length) return [];
    return rawData.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
  };
  
  // Format values for y-axis
  const formatValues = (rawData) => {
    if (!rawData || !rawData.length) return [];
    return rawData.map(item => item.value);
  };
  
  // Prepare chart data
  const chartData = {
    labels: formatDateLabels(data),
    datasets: [
      {
        label,
        data: formatValues(data),
        borderColor: color,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${label}: ${context.raw}${unit}`;
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#64748b',
        font: {
          size: 14,
          weight: 'normal'
        },
        padding: {
          bottom: 10
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return `${value}${unit}`;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="card p-4">
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

HealthTrendChart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      value: PropTypes.number.isRequired
    })
  ).isRequired,
  color: PropTypes.string,
  label: PropTypes.string,
  unit: PropTypes.string,
  height: PropTypes.number
}; 