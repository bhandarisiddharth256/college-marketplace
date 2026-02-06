import CartItem from "../models/CartItem.model.js";
import WishlistItem from "../models/WishlistItem.model.js";
import Notification from "../models/Notification.model.js";

const cleanupListingReferences = async (listingId) => {
  await CartItem.deleteMany({ listing: listingId });
  await WishlistItem.deleteMany({ listing: listingId });
  await Notification.deleteMany({ listing: listingId });
};

export default cleanupListingReferences;
