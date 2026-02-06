import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyListings,
  deleteListing,
  markListingAsSold,
} from "../api/listings.api";

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchMyListings = async () => {
    try {
      const res = await getMyListings();
      setListings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  // ❌ DELETE
  const handleDelete = async (listingId) => {
    const ok = window.confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      await deleteListing(listingId);
      fetchMyListings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete listing");
    }
  };

  // ✅ MARK SOLD
  const handleMarkSold = async (listingId) => {
    const ok = window.confirm("Mark this listing as SOLD?");
    if (!ok) return;

    try {
      await markListingAsSold(listingId);
      fetchMyListings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as sold");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">My Listings</h2>

        <button
          onClick={() => navigate("/add-listing")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Listing
        </button>
      </div>

      {listings.length === 0 && <p>You have not added any listings yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map((item) => (
          <div key={item._id} className="border p-4 rounded shadow-sm">
            <h3 className="font-semibold text-lg">{item.title}</h3>

            <p className="text-gray-600 text-sm">
              ₹{item.price} • {item.category}
            </p>

            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                item.status === "sold"
                  ? "bg-red-200 text-red-700"
                  : "bg-green-200 text-green-700"
              }`}
            >
              {item.status === "sold" ? "Sold" : "Available"}
            </span>

            <div className="flex gap-2 mt-4">
              {/* EDIT */}
                <button
                disabled={item.status === 'sold'}
                onClick={() =>
                    navigate(`/edit-listing/${item._id}`)
                }
                className={`px-3 py-1 rounded ${
                    item.status === 'sold'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500 text-white'
                }`}
                >
                {item.status === 'sold' ? 'Edit Disabled' : 'Edit'}
                </button>

              {/* DELETE */}
              <button
                onClick={() => handleDelete(item._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

              {/* MARK SOLD */}
              <button
                disabled={item.status === "sold"}
                onClick={() => handleMarkSold(item._id)}
                className={`px-3 py-1 rounded ${
                  item.status === "sold"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white"
                }`}
              >
                {item.status === "sold" ? "Sold" : "Mark Sold"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyListings;
