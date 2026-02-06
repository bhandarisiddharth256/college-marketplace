import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getMyCart,
  removeFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/", protect, addToCart);
router.get("/", protect, getMyCart);
router.delete("/:id", protect, removeFromCart);

export default router;
