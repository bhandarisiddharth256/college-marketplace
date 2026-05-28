import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16">
      <div className="card w-full max-w-5xl p-10 sm:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              Campus-first buying and selling
            </p>
            <h1 className="section-title leading-tight">
              Buy, sell and chat with confidence inside your college community.
            </h1>
            <p className="mt-6 max-w-2xl text-slate-600 text-lg leading-8">
              CollegeMarketplace brings student buyers and sellers together with secure listings, fast messaging, and polished user experience.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={handleSearch} className="primary-button">
                Search listings
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="secondary-button"
              >
                Explore marketplace
              </button>
            </div>
          </div>

          <div className="rounded-[28px] bg-brand-600/5 p-8 shadow-soft border border-brand-100">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Find great campus deals instantly
            </h2>
            <div className="space-y-4 text-slate-700">
              <p className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
                📚 Textbooks, notes, and study guides at student prices.
              </p>
              <p className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
                💻 Laptops, phones, and accessories from nearby sellers.
              </p>
              <p className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
                💬 Built-in chat keeps trades fast, safe, and local.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 w-full rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Search books, gadgets, notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <button
              onClick={handleSearch}
              className="primary-button w-full sm:w-auto"
            >
              Search marketplace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
