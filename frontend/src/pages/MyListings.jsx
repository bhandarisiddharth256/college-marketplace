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
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="card max-w-6xl mx-auto p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">My Listings</h2>
            <p className="text-slate-500 mt-1">Manage your active listings, mark sold items, or edit details.</p>
          </div>

          <button
            onClick={() => navigate("/add-listing")}
            className="rounded-full bg-brand-600 text-white px-5 py-3 transition hover:bg-brand-700"
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

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                disabled={item.status === 'sold'}
                onClick={() => navigate(`/edit-listing/${item._id}`)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  item.status === 'sold'
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {item.status === 'sold' ? 'Edit Disabled' : 'Edit'}
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold transition hover:bg-red-700"
              >
                Delete
              </button>

              <button
                disabled={item.status === 'sold'}
                onClick={() => handleMarkSold(item._id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  item.status === 'sold'
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {item.status === 'sold' ? 'Sold' : 'Mark Sold'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default MyListings;
