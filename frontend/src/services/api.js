import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor to inject JWT Bearer token into headers
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('delhi_portal_token') ||
      sessionStorage.getItem('delhi_portal_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and session clearance on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected server error occurred.';

    // Clear stale session on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('delhi_portal_token');
      localStorage.removeItem('delhi_portal_user');
      sessionStorage.removeItem('delhi_portal_token');
      sessionStorage.removeItem('delhi_portal_user');
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data
    });
  }
);

export default api;
