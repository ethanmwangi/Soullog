// Frontend/src/services/api.js

import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from localStorage.
    const token = localStorage.getItem('authToken');
    console.log('Interceptor: Retrieved token:', token);

    if (token) {
      // 2. The token is a plain string, so it should be sent directly.
      config.headers.Authorization = `Token ${token}`;
      console.log('Interceptor: Authorization header set:', config.headers.Authorization);
    } else {
      console.log('Interceptor: No token found in localStorage.');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      if (response.data.token) {
        console.log('Register success: Token received.', response.data.token);
        // 3. Store the token as a plain string.
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  // Login user  
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      if (response.data.token) {
        console.log('Login success: Token received.', response.data.token);
        // 4. Store the token as a plain string.
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch (error) { 
      throw error.response?.data || { error: 'Failed to get user info' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout/');
      localStorage.removeItem('authToken');
      console.log('Logout: Token removed from localStorage.');
    } catch (error) {
      // Even if API call fails, remove token locally
      localStorage.removeItem('authToken');
    }
  }
};

// Journal API functions
export const journalAPI = {
  // Create journal entry
  createEntry: async (entryData) => {
    try {
      const response = await api.post('/entries/', entryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create entry' };
    }
  },

  // Get all entries
  getEntries: async () => {
    try {
      const response = await api.get('/entries/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get entries' };
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get dashboard stats' };
    }
  }
};

export default api;
