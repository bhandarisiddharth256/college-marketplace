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
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title">Marketplace</h2>
            {search && (
              <p className="mt-2 text-slate-500">
                Showing results for <span className="font-semibold text-slate-900">"{search}"</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCategory("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${category === "all" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              All
            </button>
            <button
              onClick={() => setCategory("books")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${category === "books" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              Books
            </button>
            <button
              onClick={() => setCategory("electronics")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${category === "electronics" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              Electronics
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="card p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Sort & Filter</h3>
              <div className="space-y-4">
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Sort by Price</option>
                  <option value="low">Low → High</option>
                  <option value="high">High → Low</option>
                </select>

                <div className="grid gap-3">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6 bg-brand-600/5 border-brand-100">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Campus marketplace</p>
              <p className="mt-4 text-slate-600 leading-7 text-sm">
                Browse high-quality listings from students nearby, then message and finalize trades with confidence.
              </p>
              <div className="mt-5 space-y-3 text-slate-700 text-sm">
                <p className="rounded-2xl bg-white px-4 py-3 border border-brand-100">Quick local delivery</p>
                <p className="rounded-2xl bg-white px-4 py-3 border border-brand-100">Verified student accounts</p>
              </div>
            </div>
          </aside>

          <section>
            {filteredListings.length === 0 ? (
              <div className="card p-8 text-center text-slate-500">No listings found</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/listings/${item._id}`)}
                    className="card cursor-pointer p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-4">
                      <span className="text-sm uppercase tracking-[0.18em] text-brand-600">{item.category || "Listing"}</span>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-slate-600 mb-5">
                      {item.description?.slice(0, 96)}...
                    </p>
                    <div className="flex items-center justify-between gap-4 text-slate-900 font-semibold">
                      <span className="text-lg">₹{item.price}</span>
                      <span className="badge">{item.status || "Available"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;
