import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import HealthLog from './pages/HealthLog';
import HealthHistory from './pages/HealthHistory';
import Insights from './pages/Insights';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import Layout from './components/Layout';
import Db2 from './pages/Dashboard2';
import ProtectedRoute from './components/ProtectedRoute';

// Simple wrapper that just renders children
const RouteWrapper = ({ children }) => {
  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RouteWrapper>
              <Layout />
            </RouteWrapper>
          </ProtectedRoute>
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