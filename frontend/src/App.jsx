import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import HealthLog from './pages/HealthLog';
import HealthHistory from './pages/HealthHistory';
import Insights from './pages/Insights';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';
import Db2 from './pages/Dashboard2';

// Simple wrapper that just renders children
const RouteWrapper = ({ children }) => {
  return children;
};

function App() {
  return (
    <Routes>
      {/* Redirect all root paths to dashboard */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      
      {/* Main application routes */}
      <Route 
        path="/" 
        element={
          <RouteWrapper>
            <Layout />
          </RouteWrapper>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cam" element={<Db2/>} />
        
        {/* Health tracking routes */}
        <Route path="log" element={<HealthLog />} />
        <Route path="history" element={<HealthHistory />} />
        <Route path="insights" element={<Insights />} />
      </Route>
      
      {/* Not Found - Redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 