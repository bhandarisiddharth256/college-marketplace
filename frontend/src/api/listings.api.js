import api from './axios';

// Public listings
export const getAllListings = async () => {
  const response = await api.get('/api/listings');
  return response.data;
};

// My listings
export const getMyListings = async () => {
  const response = await api.get('/api/listings/my');
  return response.data;
};

// ➕ Add new listing
export const createListing = async (formData) => {
  const response = await api.post('/api/listings', formData);
  return response.data;
};

// Get single listing by ID
export const getListingById = async (id) => {
  const response = await api.get(`/api/listings/${id}`);
  return response.data;
};

// Update listing (EDIT)
export const updateListing = async (listingId, formData) => {
  const res = await api.put(
    `/api/listings/${listingId}`,
    formData
  );
  return res.data;
};

// Delete listing
export const deleteListing = async (listingId) => {
  const res = await api.delete(`/api/listings/${listingId}`);
  return res.data;
};

// Mark listing as sold
export const markListingAsSold = async (listingId) => {
  const res = await api.patch(
    `/api/listings/${listingId}/sold`
  );
  return res.data;
};

// Remove single image
export const removeListingImage = async (listingId, imageUrl) => {
  const res = await api.patch(
    `/api/listings/${listingId}/remove-image`,
    { imageUrl }
  );
  return res.data;
};

// Reorder images
export const reorderListingImages = async (
  listingId,
  images
) => {
  const res = await api.patch(
    `/api/listings/${listingId}/reorder-images`,
    { images }
  );
  return res.data;
};
