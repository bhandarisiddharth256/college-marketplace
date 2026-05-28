import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListingById } from "../api/listings.api";
import { useAuth } from "../context/AuthContext";
import { addToCart, getCart } from "../api/cart.api";
import { addToWishlist, getWishlist } from "../api/wishlist.api";

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
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
        setError(err.response?.data?.message || "Failed to load listing");
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

        setIsInCart(cartItems.some((item) => item.listing._id === listing._id));

        setIsInWishlist(
          wishlistItems.some((item) => item.listing._id === listing._id),
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
      alert(err.response?.data?.message || "Failed to add to cart");
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
      alert(err.response?.data?.message || "Failed to add to wishlist");
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
  const isOwner = user && listing.owner === user._id;

  const isSold = listing.status === "sold";

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="card max-w-5xl mx-auto p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold">{listing.title}</h2>
          <p className="text-sm text-slate-500 mt-2">
            {listing.description?.slice(0, 120)}
          </p>
        </div>

        {listing.images?.length > 0 && (
          <div className="relative mb-6 rounded-3xl overflow-hidden shadow-soft bg-slate-100">
          {/* IMAGE */}
          <img
            src={listing.images[currentImage]}
            alt={listing.title}
            className="w-full max-h-96 object-cover rounded"
          />

          {/* PREV */}
          <button
            onClick={() =>
              setCurrentImage((prev) =>
                prev === 0 ? listing.images.length - 1 : prev - 1,
              )
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
          >
            ‹
          </button>

          {/* NEXT */}
          <button
            onClick={() =>
              setCurrentImage((prev) =>
                prev === listing.images.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
          >
            ›
          </button>

          {/* DOTS */}
          <div className="flex justify-center gap-2 mt-3">
            {listing.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-3 w-3 rounded-full transition-all ${
                  currentImage === index
                    ? "bg-blue-600 scale-110"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-4">{listing.description}</p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <span className="text-3xl font-bold text-brand-600">
          ₹{listing.price}
        </span>

        <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
          {listing.condition}
        </span>
      </div>

      <p className="text-sm text-gray-500">Category: {listing.category}</p>

      {isSold && (
        <p className="mt-4 text-red-600 font-medium">This item is sold</p>
      )}

      {/* ---------------- ACTIONS ---------------- */}
      {!isSold && (
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr] items-start">
          {!isOwner ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                disabled={isInWishlist}
                onClick={handleAddToWishlist}
                className={`rounded-full px-5 py-3 transition ${
                  isInWishlist
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : "bg-pink-600 text-white hover:bg-pink-700"
                }`}
              >
                {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
              </button>

              <button
                disabled={isInCart}
                onClick={handleAddToCart}
                className={`rounded-full px-5 py-3 transition ${
                  isInCart
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                {isInCart ? "In Cart" : "Add to Cart"}
              </button>
            </div>
          ) : (
            <p className="text-slate-600 italic">This is your listing</p>
          )}

          {!isOwner && (
            <button
              onClick={handleChat}
              className="rounded-full bg-emerald-600 text-white px-5 py-3 transition hover:bg-emerald-700"
            >
              Chat with Seller
            </button>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

export default ListingDetails;
