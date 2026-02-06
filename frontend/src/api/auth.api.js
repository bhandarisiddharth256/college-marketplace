import api from './axios';

// Login
export const loginUser = async (data) => {
  const response = await api.post('/api/auth/login', data);
  return response.data;
};

// Register
export const registerUser = async (data) => {
  const response = await api.post('/api/auth/register', data);
  return response.data;
};
