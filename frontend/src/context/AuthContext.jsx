import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment ? 'http://localhost:8080' : '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverAvailable, setServerAvailable] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setAuthToken(storedToken);
      loadUser();
    } else {
      setLoading(false);
    }

    checkServerAvailability();
  }, []);

  const checkServerAvailability = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/health`);
      setServerAvailable(true);
    } catch (err) {
      console.warn('Server not available:', err.message);
      setServerAvailable(false);
    }
  };


  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error loading user:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Server is not available. Please try again later.');
        setServerAvailable(false);
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    if (!serverAvailable) {
      setError('Server is not available. Please try again later.');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && res.data.token) {
        setToken(res.data.token);
        setAuthToken(res.data.token);
        
        if (res.data.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
        
        return true;
      } else {
        setError('Registration failed: Invalid server response');
        return false;
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Server is not available. Please try again later.');
        setServerAvailable(false);
      } else {
        setError(err.response?.data?.message || 'Registration failed: ' + err.message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    if (!serverAvailable) {
      setError('Server is not available. Please try again later.');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && res.data.token) {
        setToken(res.data.token);
        setAuthToken(res.data.token);
        
        if (res.data.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
        
        return true;
      } else {
        setError('Login failed: Invalid server response');
        return false;
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Server is not available. Please try again later.');
        setServerAvailable(false);
      } else {
        setError(err.response?.data?.message || 'Login failed: ' + err.message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
  };

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
        serverAvailable,
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