import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getWishlist,
  removeFromWishlist,
  moveWishlistToCart,
} from "../api/wishlist.api";
import { getCart } from "../api/cart.api";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartListingIds, setCartListingIds] = useState([]);

  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const wishlistRes = await getWishlist();
      const cartRes = await getCart();

      const wishlistItems = wishlistRes.data || [];
      const cartItems = cartRes.data || [];

      // 🧹 REMOVE SOLD ITEMS
      const activeWishlist = wishlistItems.filter(
        (item) => item.listing.status !== "sold",
      );

      const cartIds = cartItems.map((item) => item.listing._id);

      setItems(activeWishlist);
      setCartListingIds(cartIds);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // 🔁 MOVE TO CART
  const handleMoveToCart = async (listingId, e) => {
    // e.stopPropagation(); // 🔥 IMPORTANT
    try {
      await moveWishlistToCart(listingId);
      fetchWishlist(); // refresh UI
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move item to cart");
    }
  };

  // ❌ REMOVE FROM WISHLIST
  const handleRemove = async (listingId, e) => {
    // e.stopPropagation(); // 🔥 IMPORTANT
    try {
      await removeFromWishlist(listingId);
      fetchWishlist();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove item");
    }
  };

  if (loading) return <p className="p-6">Loading wishlist...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="card max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold">Wishlist</h2>
          <p className="text-slate-500 mt-1">Save favorite listings and move them into your cart quickly.</p>
        </div>

        {items.length === 0 && <p>No items in wishlist.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const alreadyInCart = cartListingIds.includes(item.listing._id);

          return (
            <div
              key={item._id} // wishlist item id
              onClick={() => navigate(`/listings/${item.listing._id}`)}
              className="border p-4 rounded shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{item.listing.title}</h3>

              <p className="text-sm text-gray-600">
                Category: {item.listing.category}
              </p>

              <p className="text-blue-600 font-bold mt-1">
                ₹{item.listing.price}
              </p>

              <span className="inline-block mt-1 text-xs px-2 py-1 bg-gray-200 rounded">
                {item.listing.status}
              </span>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  disabled={alreadyInCart}
                  onClick={(e) => {
                    if (!alreadyInCart) {
                      handleMoveToCart(item._id);
                    }
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    alreadyInCart
                      ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {alreadyInCart ? "Already in Cart" : "Move to Cart"}
                </button>

                <button
                  onClick={(e) => {
                    handleRemove(item._id);
                  }}
                  className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold transition hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>

  );
}

export default Wishlist;
