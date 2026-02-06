import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListingById } from "../api/listings.api";
import { useAuth } from "../context/AuthContext";
import { addToCart, getCart } from "../api/cart.api";
import { addToWishlist, getWishlist } from "../api/wishlist.api";

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  /* ---------------- FETCH LISTING ---------------- */
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await getListingById(id);
        setListing(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load listing"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  /* ---------------- CHECK CART / WISHLIST ---------------- */
  useEffect(() => {
    if (!isAuthenticated || !listing) return;

    const checkCartWishlist = async () => {
      try {
        const cartRes = await getCart();
        const wishlistRes = await getWishlist();

        const cartItems = cartRes.data || [];
        const wishlistItems = wishlistRes.data || [];

        setIsInCart(
          cartItems.some(
            (item) => item.listing._id === listing._id
          )
        );

        setIsInWishlist(
          wishlistItems.some(
            (item) => item.listing._id === listing._id
          )
        );
      } catch (err) {
        console.error("Failed to check cart/wishlist");
      }
    };

    checkCartWishlist();
  }, [listing, isAuthenticated]);

  /* ---------------- HANDLERS ---------------- */
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(listing._id);
      setIsInCart(true);
      alert("Added to cart");
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to add to cart"
      );
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addToWishlist(listing._id);
      setIsInWishlist(true);
      alert("Added to wishlist");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to add to wishlist"
      );
    }
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(`/messages?listingId=${listing._id}`);
    }
  };

  /* ---------------- LOADING / ERROR ---------------- */
  if (loading) {
    return <p className="p-6">Loading listing...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!listing) {
    return <p className="p-6">Listing not found</p>;
  }

  /* ---------------- OWNER CHECK (SAFE PLACE) ---------------- */
  const isOwner =
    user && listing.owner === user._id;

  const isSold = listing.status === "sold";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        {listing.title}
      </h2>

      {listing.images?.length > 0 && (
        <div className="mb-4">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full max-h-96 object-cover rounded"
          />
        </div>
      )}

      <p className="text-gray-600 mb-4">
        {listing.description}
      </p>

      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-blue-600">
          ₹{listing.price}
        </span>

        <span className="px-3 py-1 bg-gray-200 rounded text-sm">
          {listing.condition}
        </span>
      </div>

      <p className="text-sm text-gray-500">
        Category: {listing.category}
      </p>

      {isSold && (
        <p className="mt-4 text-red-600 font-medium">
          This item is sold
        </p>
      )}

      {/* ---------------- ACTIONS ---------------- */}
      {!isSold && (
        <div className="mt-6 flex flex-wrap gap-3">
          {!isOwner ? (
            <>
              <button
                disabled={isInWishlist}
                onClick={handleAddToWishlist}
                className={`px-4 py-2 rounded ${
                  isInWishlist
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-600 text-white"
                }`}
              >
                {isInWishlist
                  ? "In Wishlist"
                  : "Add to Wishlist"}
              </button>

              <button
                disabled={isInCart}
                onClick={handleAddToCart}
                className={`px-4 py-2 rounded ${
                  isInCart
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isInCart ? "In Cart" : "Add to Cart"}
              </button>

              <button
                onClick={handleChat}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Chat with Seller
              </button>
            </>
          ) : (
            <p className="text-gray-600 italic">
              This is your listing
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ListingDetails;
