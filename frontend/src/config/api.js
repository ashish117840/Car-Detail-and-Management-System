import axios from 'axios';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://car-detail-and-management-system.onrender.com';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      try {
        const { token: authToken } = JSON.parse(token);
        config.headers.Authorization = `Bearer ${authToken}`;
      } catch (error) {
        console.error('Error parsing auth token:', error);
        sessionStorage.removeItem('auth_token');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/api/users/login') || requestUrl.includes('/api/users/register');

    // Only force logout/redirect for protected requests, not failed login/register attempts.
    if (status === 401 && !isAuthRequest) {
      const tokenData = sessionStorage.getItem('auth_token');
      if (tokenData) {
        sessionStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
