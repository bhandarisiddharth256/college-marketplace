import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getPriceSuggestion } from "../controllers/price.controller.js";

const router = express.Router();

router.post("/suggest", protect, getPriceSuggestion);

export default router;
