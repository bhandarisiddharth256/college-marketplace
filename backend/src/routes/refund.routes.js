import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { refundOrder } from "../controllers/refund.controller.js";

const router = express.Router();

// Buyer refund (admin can also allow later)
router.post("/:paymentId", protect, refundOrder);

export default router;
