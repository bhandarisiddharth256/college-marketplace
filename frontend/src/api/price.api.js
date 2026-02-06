import api from './axios';

export const suggestPrice = async (data) => {
  const res = await api.post('/api/price/suggest', data);
  return res.data;
};
