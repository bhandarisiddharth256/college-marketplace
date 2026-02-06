import api from "./axios";

// -----------------------------
// GET MY PROFILE
// -----------------------------
export const getMyProfile = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

// -----------------------------
// UPDATE MY PROFILE
// -----------------------------
// Thinking:
// - Only name & college editable
// - Email NOT editable (safer)
export const updateMyProfile = async (data) => {
  const response = await api.put("/api/users/me", data);
  return response.data;
};

