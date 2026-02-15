import { useEffect, useState } from "react";
import { getAdminListings, deleteAdminListing } from "../../api/admin.api";

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [statusOpen, setStatusOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [confirmId, setConfirmId] = useState(null);

  const fetchListings = async () => {
    try {
      const res = await getAdminListings();
      setListings(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error("Failed to load listings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  /* 🔍 Search + Status Filter */
  useEffect(() => {
    let result = listings;

    if (search) {
      result = result.filter((l) =>
        l.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    setFiltered(result);
    setPage(1);
  }, [search, listings, statusFilter]);

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const current = filtered.slice(start, start + perPage);

  const handleDelete = async () => {
    try {
      await deleteAdminListing(confirmId);
      setConfirmId(null);
      fetchListings();
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <p>Loading listings...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listings</h1>

      {/* FILTER BAR */}
      <div className="flex gap-3 mb-4">
        {/* STATUS DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="border px-4 py-2 rounded bg-white"
          >
            Status ▾
          </button>

          {statusOpen && (
            <div className="absolute mt-2 bg-white border rounded shadow w-32 z-20">
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setStatusOpen(false);
                }}
                className="block w-full px-3 py-2 text-left hover:bg-gray-100"
              >
                All
              </button>

              <button
                onClick={() => {
                  setStatusFilter("available");
                  setStatusOpen(false);
                }}
                className="block w-full px-3 py-2 text-left hover:bg-gray-100"
              >
                Available
              </button>

              <button
                onClick={() => {
                  setStatusFilter("sold");
                  setStatusOpen(false);
                }}
                className="block w-full px-3 py-2 text-left hover:bg-gray-100"
              >
                Sold
              </button>
            </div>
          )}
        </div>

        {/* SEARCH */}
        <input
          placeholder="Search by title..."
          className="border p-2 rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-center">Price</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {current.map((l) => (
              <tr key={l._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{l.title}</td>

                <td className="p-3 text-center font-semibold">₹{l.price}</td>

                <td className="p-3 text-gray-600">{l.owner?.email}</td>

                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      l.status === "sold"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => setConfirmId(l._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-black text-white rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-black text-white rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="font-semibold mb-4">Delete this listing?</h3>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Listings;
