import CartItem from "../models/CartItem.model.js";
import WishlistItem from "../models/WishlistItem.model.js";
import Listing from "../models/Listing.model.js";

const cleanupSoldListing = async (listingId) => {
  const listing = await Listing.findById(listingId).select("title");

  // Find affected cart users
  const cartItems = await CartItem.find({ listing: listingId });
  const wishlistItems = await WishlistItem.find({ listing: listingId });


  // Cleanup
  await CartItem.deleteMany({ listing: listingId });
  await WishlistItem.deleteMany({ listing: listingId });
};

export default cleanupSoldListing;
