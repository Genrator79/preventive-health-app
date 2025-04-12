import React, { useState, useEffect } from 'react';

import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';


const Db2 = () => {

  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('capture');

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await axios.get('/api/health-data');
        console.log('Fetched health data:', response.data);
        setHealthData(response.data);
      } catch (error) {
        console.error('Error fetching health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Health Tracker</h1>
        <p>Take a snapshot to analyze your health metrics</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'capture' ? 'active' : ''} 
          onClick={() => setActiveTab('capture')}
        >
          Capture & Analyze
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')}
        >
          Health History
        </button>
      </div>

      <div className="dashboard-content">
        {/* {activeTab === 'capture' ? (
          <WebcamCapture />
        ) : (
        //   <HealthHistory healthData={healthData} loading={loading} />
        )} */}
          <WebcamCapture />
      </div>
    </div>
  );
};

export default Db2;
