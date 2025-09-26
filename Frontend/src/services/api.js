// Frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('Interceptor: Retrieved token:', token);

    if (token) {
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

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      if (response.data.token) {
        console.log('Register success: Token received and stored.');
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      if (response.data.token) {
        console.log('Login success: Token received and stored.');
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch (error) { 
      throw error.response?.data || { error: 'Failed to get user info' };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
      localStorage.removeItem('authToken');
      console.log('Logout: Token removed from localStorage.');
    } catch (error) {
      localStorage.removeItem('authToken');
    }
  }
};

export const journalAPI = {
  createEntry: async (entryData) => {
    try {
      const response = await api.post('/entries/', entryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create entry' };
    }
  },

  getEntries: async () => {
    try {
      const response = await api.get('/entries/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get entries' };
    }
  },

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