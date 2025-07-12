import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => apiClient.post('/users/register', userData),
  login: (userData) => apiClient.post('/users/login', userData),
};

// Portfolio API calls
export const portfolioAPI = {
  getPortfolio: () => apiClient.get('/portfolio'),
  addAddress: (addressData) => apiClient.post('/portfolio/address', addressData),
  deleteAddress: (addressId) => apiClient.delete(`/portfolio/address/${addressId}`),
};

export default apiClient;
