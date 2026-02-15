import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getAdminStats,
  getUsersAdmin,
  getListingsAdmin,
  deleteListingAdmin,
  getReportedMessages,
  deleteReportedMessage
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect,isAdmin);

router.get("/stats",getAdminStats);
router.get("/users",getUsersAdmin);
router.get("/listings",getListingsAdmin);
router.delete("/listings/:id",deleteListingAdmin);
router.get("/reported-messages",getReportedMessages);
router.delete("/messages/:id",deleteReportedMessage);

export default router;
