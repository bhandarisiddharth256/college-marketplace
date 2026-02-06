import api from "./axios";

/**
 * Create Razorpay order
 * Backend:
 * POST /api/payment/create-order
 */
export const createOrder = (listingId) => {
  return api.post("/api/payment/create-order", { listingId });
};

/**
 * Verify Razorpay payment
 * Backend:
 * POST /api/payment/verify
 */
// 🔐 verify payment
export const verifyPayment = (payload) => {
  return api.post("/api/payment/verify", payload);
};
