import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
      setResults(null);
      setError(null);
    }
  }, [webcamRef]);

  const analyzeImage = async () => {
    if (!image) return;
    
    setProcessing(true);
    setError(null);
    
    try {
    
      const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
      const blob = await (await fetch(`data:image/jpeg;base64,${base64Data}`)).blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      const response = await axios.post('http://localhost:8080/api/analyze' ,formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Analysis results:', response.data);
      
      setResults(response.data);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="webcam-container">
      <div className="webcam-view">
        {!image ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: "user",
              width: 640,
              height: 480
            }}
          />
        ) : (
          <img src={image} alt="Captured" />
        )}
      </div>
      
      <div className="controls">
        {!image ? (
          <button onClick={capture} className="capture-btn">Capture Photo</button>
        ) : (
          <>
            <button onClick={() => setImage(null)} className="retake-btn">Retake</button>
            <button 
              onClick={analyzeImage} 
              disabled={processing}
              className="analyze-btn"
            >
              {processing ? 'Processing...' : 'Analyze Health'}
            </button>
          </>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {results && (
        <div className="results-container">
          <h2>Your Health Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Mood</h3>
              <p className="metric-value">{results.mood} <span></span></p>
              <p className="metric-status">{results.heartRateStatus}</p>
            </div>
            <div className="metric-card">
              <h3>Relaxation Level</h3>
              <p className="metric-value">{results.relaxationLevel} <span></span></p>
              <p className="metric-status">{results.respiratoryRateStatus}</p>
            </div>
            <div className="metric-card">
              <h3>Fatigue Level</h3>
              <p className="metric-value">{results.fatigueLevel}<span>/10</span></p>
              <p className="metric-status">{results.oxygenSaturationStatus}</p>
            </div>
            <div className="metric-card">
              <h3>Stress Level</h3>
              <p className="metric-value">{results.stressLevel}<span>/10</span></p>
              <p className="metric-status">{results.stressLevelStatus}</p>
            </div>
          </div>
          
          <div className="ai-recommendations">
            <h3>AI Health Recommendations</h3>
            <ul>
              {results.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
