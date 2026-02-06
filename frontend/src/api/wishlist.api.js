import api from './axios';

// Get wishlist
export const getWishlist = async () => {
  const response = await api.get('/api/wishlist');
  return response.data;
};

// ✅ Add to wishlist (listingId in body)
export const addToWishlist = async (listingId) => {
  const response = await api.post('/api/wishlist', {
    listingId,
  });
  return response.data;
};

// Remove from wishlist
export const removeFromWishlist = async (listingId) => {
  const response = await api.delete(`/api/wishlist/${listingId}`);
  return response.data;
};

// ✅ Move wishlist → cart (ID in URL)
export const moveWishlistToCart = async (listingId) => {
  const response = await api.post(
    `/api/wishlist/${listingId}/move-to-cart`
  );
  return response.data;
};
