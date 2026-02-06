import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

export default router;
