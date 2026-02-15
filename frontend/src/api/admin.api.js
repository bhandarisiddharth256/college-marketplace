import api from "./axios";

export const getAdminStats = () => api.get("/api/admin/stats");

export const getAdminUsers = (page = 1) =>
  api.get(`/api/admin/users?page=${page}`);

export const getAdminListings = () =>
  api.get("/api/admin/listings");

export const deleteAdminListing = (id) =>
  api.delete(`/api/admin/listings/${id}`);

export const getReportedMessages = () =>
  api.get("/api/admin/reported-messages");

export const deleteReportedMessage = (id) =>
  api.delete(`/api/admin/messages/${id}`);