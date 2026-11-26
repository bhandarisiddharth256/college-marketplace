import Listing from "../models/Listing.model.js";
import Purchase from "../models/Purchase.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cleanupSoldListing from "../utils/cleanupSoldListing.js";

/* Buy a listing with an atomic availability check. */
export const buyListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
      status: "available",
      owner: { $ne: req.user._id },
    },
    { $set: { status: "sold" } },
    { new: true }
  );

  if (!listing) {
    const existing = await Listing.findOne({ _id: id, isDeleted: false });
    if (!existing) throw new ApiError(404, "Listing not found");
    if (existing.owner.equals(req.user._id)) {
      throw new ApiError(400, "You cannot buy your own item");
    }
    throw new ApiError(409, "Listing is no longer available");
  }

  let purchase;
  try {
    [purchase] = await Purchase.create([{
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.owner,
      price: listing.price,
    }]);
  } catch (error) {
    await Listing.updateOne(
      { _id: listing._id, status: "sold" },
      { $set: { status: "available" } }
    );
    throw error;
  }

  await cleanupSoldListing(listing._id);

  return res.status(201).json(
    new ApiResponse(201, purchase, "Item purchased successfully")
  );
});

/* Items I bought. */
export const getMyPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ buyer: req.user._id })
    .populate("listing", "title price category")
    .populate("seller", "name email college")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, purchases, "Purchased items fetched successfully")
  );
});

/* Items I sold. */
export const getMySales = asyncHandler(async (req, res) => {
  const sales = await Purchase.find({ seller: req.user._id })
    .populate("listing", "title price category")
    .populate("buyer", "name email college")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, sales, "Sold items fetched successfully")
  );
});
