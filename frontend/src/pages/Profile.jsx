import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyProfile, updateMyProfile } from "../api/user.api";
import { getCart } from "../api/cart.api";
import { getWishlist } from "../api/wishlist.api";
import { getMyPurchases, getMySales } from "../api/purchase.api";
import { getMyListings } from "../api/listings.api";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔢 activity counts
  const [counts, setCounts] = useState({
    cart: 0,
    wishlist: 0,
    purchases: 0,
    sales: 0,
    listings: 0,
  });

  // ✏️ edit profile
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    college: "",
  });

  const navigate = useNavigate();

  // ---------------------------
  // FETCH PROFILE + COUNTS
  // ---------------------------
  useEffect(() => {
    const fetchProfileAndCounts = async () => {
      try {
        // profile
        const profileRes = await getMyProfile();
        setUser(profileRes.data);

        // sync form with profile
        setFormData({
          name: profileRes.data.name,
          college: profileRes.data.college,
        });

        // counts (parallel)
        const [
          cartRes,
          wishlistRes,
          purchaseRes,
          salesRes,
          listingRes,
        ] = await Promise.all([
          getCart(),
          getWishlist(),
          getMyPurchases(),
          getMySales(),
          getMyListings(),
        ]);

        setCounts({
          cart: cartRes.data?.length || 0,
          wishlist: wishlistRes.data?.length || 0,
          purchases: purchaseRes.data?.data?.length || 0,
          sales: salesRes.data?.data?.length || 0,
          listings: listingRes.data?.length || 0,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndCounts();
  }, []);

  // ---------------------------
  // EDIT PROFILE HANDLERS
  // ---------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await updateMyProfile(formData);
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || "Profile update failed");
    }
  };

  // ---------------------------
  // UI STATES
  // ---------------------------
  if (loading) return <p className="p-6">Loading profile...</p>;

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  if (!user) {
    return (
      <p className="p-6 text-red-600">
        User object missing — check API response shape
      </p>
    );
  }

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">My Profile</h2>

      {/* 👤 USER INFO */}
      <div className="border rounded p-4 mb-6">
        {isEditing ? (
          <>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
              placeholder="Name"
            />

            <input
              name="college"
              value={formData.college}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
              placeholder="College"
            />

            <button
              onClick={handleSave}
              className="bg-black text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>College:</strong> {user.college}
            </p>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 border px-3 py-1 rounded"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* ⚡ ACTIVITY */}
      <div>
        <h3 className="text-lg font-semibold mb-3">My Activity</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button onClick={() => navigate("/cart")} className="border p-3 rounded">
            🛒 Cart ({counts.cart})
          </button>

          <button
            onClick={() => navigate("/wishlist")}
            className="border p-3 rounded"
          >
            ❤️ Wishlist ({counts.wishlist})
          </button>

          <button
            onClick={() => navigate("/purchases")}
            className="border p-3 rounded"
          >
            📦 My Purchases ({counts.purchases})
          </button>

          <button
            onClick={() => navigate("/sales")}
            className="border p-3 rounded"
          >
            💰 My Sales ({counts.sales})
          </button>

          <button
            onClick={() => navigate("/my-listings")}
            className="border p-3 rounded"
          >
            📢 My Listings ({counts.listings})
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
