import axios from 'axios';

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL,
 timeout: 15000,
 withCredentials: true
});

// REQUEST INTERCEPTOR — attach token
api.interceptors.request.use(
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

// RESPONSE INTERCEPTOR — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('401 detected, logging out');
      localStorage.removeItem('token');
      // DO NOT force reload immediately
    }
    return Promise.reject(error);
  }
);


export default api;
