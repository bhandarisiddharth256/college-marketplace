import { useEffect, useState } from "react";
import { getAllListings } from "../api/listings.api";
import { useNavigate, useLocation } from "react-router-dom";

function Marketplace() {
  const navigate = useNavigate();
  const location = useLocation();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [category, setCategory] = useState("all");
  const [priceSort, setPriceSort] = useState("");

  // 🔹 SEARCH FROM URL
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get("search") || "";
  const searchTerm = search.toLowerCase();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await getAllListings();
        const data = Array.isArray(res.data) ? res.data : res.data?.listings;

        setListings(data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // 🔹 FILTER + SORT
  let filteredListings = listings.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm);

    const matchesCategory = category === "all" || item.category === category;

    const price = Number(item.price);

    const matchesMinPrice = !minPrice || price >= Number(minPrice);

    const matchesMaxPrice = !maxPrice || price <= Number(maxPrice);

    return (
      matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
    );
  });

  if (priceSort === "low") {
    filteredListings.sort((a, b) => a.price - b.price);
  }

  if (priceSort === "high") {
    filteredListings.sort((a, b) => b.price - a.price);
  }

  if (loading) return <p className="p-6">Loading marketplace...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Marketplace</h2>

      {/* SEARCH INFO */}
      {search && (
        <p className="mb-4 text-gray-500">
          Showing results for <span className="font-medium">"{search}"</span>
        </p>
      )}

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* CATEGORY */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All Categories</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="others">Others</option>
        </select>

        {/* PRICE SORT */}
        <select
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Sort by Price</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>

        {/* PRICE RANGE */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border px-3 py-2 rounded w-24"
          />

          <span className="text-gray-500">–</span>

          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border px-3 py-2 rounded w-24"
          />
        </div>
      </div>

      {/* NO RESULTS */}
      {filteredListings.length === 0 ? (
        <p className="text-gray-500">No listings found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/listings/${item._id}`)}
              className="cursor-pointer border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

              <p className="text-sm text-gray-600 mb-3">
                {item.description?.slice(0, 80)}...
              </p>

              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-bold">₹{item.price}</span>

                <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Marketplace;
