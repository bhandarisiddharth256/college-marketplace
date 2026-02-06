import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get latest notifications (limit 5)
router.get("/", protect, getMyNotifications);

// Delete notification after read
router.delete("/:id", protect, deleteNotification);

export default router;
