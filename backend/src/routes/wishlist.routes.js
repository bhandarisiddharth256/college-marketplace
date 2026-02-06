import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  moveWishlistToCart,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.post("/", protect, addToWishlist);
router.get("/", protect, getMyWishlist);
router.delete("/:id", protect, removeFromWishlist);

// Move to cart
router.post("/:id/move-to-cart", protect, moveWishlistToCart);

export default router;
