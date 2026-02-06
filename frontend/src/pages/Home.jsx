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
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-white">
      
      {/* HERO CONTENT */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        Buy & Sell Within Your{" "}
        <span className="text-indigo-600">College Community</span>
      </h1>

      <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-700">
        Books, Electronics, Notes & More —{" "}
        <span className="text-indigo-600">Safely.</span>
      </h2>

      <p className="mt-6 max-w-2xl text-gray-500 text-lg">
        A trusted marketplace for college students to buy, sell, and chat —
        fast, secure, and campus-friendly.
      </p>

      {/* SEARCH BAR */}
      <div className="mt-10 flex w-full max-w-xl shadow-sm">
        <input
          type="text"
          placeholder="Search books, gadgets, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleSearch}
          className="px-6 bg-indigo-600 text-white font-medium rounded-r-md hover:bg-indigo-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default Home;
