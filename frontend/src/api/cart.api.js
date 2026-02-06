import api from './axios';

// Get cart
export const getCart = async () => {
  const response = await api.get('/api/cart');
  return response.data;
};

// ✅ Add to cart (listingId in body)
export const addToCart = async (listingId) => {
  const response = await api.post('/api/cart', {
    listingId,
  });
  return response.data;
};

// Remove from cart
export const removeFromCart = async (listingId) => {
  const response = await api.delete(`/api/cart/${listingId}`);
  return response.data;
};
