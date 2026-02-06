import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createListing,
  getAllListings,
  getMyListings,
  markListingAsSold,
  updateListing,
  deleteListing,
  getListingById,
} from "../controllers/listing.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { removeListingImage } from "../controllers/listing.controller.js";
import { reorderListingImages } from "../controllers/listing.controller.js";

const router = express.Router();

router.get("/", getAllListings);
router.get("/my", protect, getMyListings);
router.get("/:id", getListingById);
router.post("/",protect,upload.array("images", 5),createListing);
router.put("/:id",protect,upload.array("images", 5),updateListing);
router.patch("/:id/sold", protect, markListingAsSold);
router.delete("/:id", protect, deleteListing);
router.patch("/:id/remove-image", protect, removeListingImage);
router.patch("/:id/reorder-images", protect, reorderListingImages);

export default router;
