import Listing from "../models/Listing.model.js";
import Purchase from "../models/Purchase.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cleanupSoldListing from "../utils/cleanupSoldListing.js";

/* 🛒 Buy a listing */
export const buyListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.status === "sold") {
    throw new ApiError(400, "Listing already sold");
  }

  // Buyer cannot buy own listing
  if (listing.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot buy your own item");
  }

  // Create purchase record
  const purchase = await Purchase.create({
    listing: listing._id,
    buyer: req.user._id,
    seller: listing.owner,
    price: listing.price,
  });

  // Mark listing as sold
  listing.status = "sold";
  await listing.save();

  // 🧹 Remove from carts & wishlists
  await cleanupSoldListing(listing._id);

  return res.status(201).json(
    new ApiResponse(201, purchase, "Item purchased successfully")
  );
});

/* 🛍️ Items I bought */
export const getMyPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({
    buyer: req.user._id,
  })
    .populate("listing", "title price category")
    .populate("seller", "name email college")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      purchases,
      "Purchased items fetched successfully"
    )
  );
});

/* 💰 Items I sold */
export const getMySales = asyncHandler(async (req, res) => {
  const sales = await Purchase.find({
    seller: req.user._id,
  })
    .populate("listing", "title price category")
    .populate("buyer", "name email college")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      sales,
      "Sold items fetched successfully"
    )
  );
});


