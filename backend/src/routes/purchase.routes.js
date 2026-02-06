import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  buyListing,
  getMyPurchases,
  getMySales,
} from "../controllers/purchase.controller.js";

const router = express.Router();

// Buy an item
router.post("/:id", protect, buyListing);

// Dashboards
router.get("/my/bought", protect, getMyPurchases);
router.get("/my/sold", protect, getMySales);

export default router;
