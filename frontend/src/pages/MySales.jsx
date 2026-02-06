import { useEffect, useState } from "react";
import { getMySales } from "../api/purchase.api";

function MySales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await getMySales();
        setSales(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load sales");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) return <p className="p-6">Loading sales...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Sales</h2>

      {sales.length === 0 && (
        <p>You haven’t sold any items yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sales.map((sale) => (
          <div
            key={sale._id}
            className="border p-4 rounded shadow-sm"
          >
            <h3 className="font-semibold text-lg">
              {sale.listing?.title}
            </h3>

            <p className="text-sm text-gray-600">
              Category: {sale.listing?.category}
            </p>

            <p className="text-green-600 font-bold mt-1">
              Sold for ₹{sale.price}
            </p>

            <div className="mt-3 text-sm">
              <p className="font-medium">Buyer Info</p>
              <p>Name: {sale.buyer?.name}</p>
              <p className="text-gray-600">
                College: {sale.buyer?.college}
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Sold on:{" "}
              {new Date(sale.createdAt).toLocaleDateString()}
            </p>

            <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
              Sold
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MySales;
