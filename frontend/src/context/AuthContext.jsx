import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Set default user and authentication state for direct access
  const [user, setUser] = useState({
    _id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    healthScore: 72,
    createdAt: new Date()
  });
  const [token, setToken] = useState('mock-jwt-token');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip loadUser effect since we're setting default user
    setLoading(false);
  }, []);

  // Set auth token for all requests
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Registering with data:', userData);
      
      // Add baseURL explicitly to make sure we're hitting the right endpoint
      const apiUrl = 'http://localhost:5001/api/auth/register';
      console.log('Making registration request to:', apiUrl);
      
      const res = await axios.post(apiUrl, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Registration response:', res.data);
      
      if (res.data && res.data.token) {
        setToken(res.data.token);
        
        // Set user data if received from the server
        if (res.data.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
          console.log('User authenticated:', res.data.user);
        } else {
          console.warn('No user data in registration response');
        }
        
        return true;
      } else {
        console.error('No token in registration response');
        setError('Registration failed: Invalid server response');
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      setError(err.response?.data?.message || 'Registration failed: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Logging in with data:', { ...userData, password: '****' });
      
      // Add baseURL explicitly to make sure we're hitting the right endpoint
      const apiUrl = 'http://localhost:5001/api/auth/login';
      console.log('Making login request to:', apiUrl);
      
      const res = await axios.post(apiUrl, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login response:', res.data);
      
      if (res.data && res.data.token) {
        setToken(res.data.token);
        
        if (res.data.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        } else {
          console.warn('No user data in login response');
        }
        
        return true;
      } else {
        console.error('No token in login response');
        setError('Login failed: Invalid server response');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      setError(err.response?.data?.message || 'Login failed: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 