import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getAllUsers,
  getAllListingsAdmin,
  deleteListingAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/users", getAllUsers);
router.get("/listings", getAllListingsAdmin);
router.delete("/listings/:id", deleteListingAdmin);

export default router;
