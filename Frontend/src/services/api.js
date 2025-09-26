// Frontend/src/services/api.js

import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Attaching token to request:', token); // DEBUG LOG
      config.headers.Authorization = `Token ${token}`;
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
        console.log('Registration successful, token received:', response.data.token); // DEBUG LOG
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
        console.log('Login successful, token received:', response.data.token); // DEBUG LOG
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