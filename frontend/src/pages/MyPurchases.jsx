import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPurchases } from "../api/purchase.api";

function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await getMyPurchases();
        setPurchases(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load purchases");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) return <p className="p-6">Loading purchases...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Purchases</h2>

      {purchases.length === 0 && <p>You haven’t purchased anything yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {purchases.map((purchase) => (
          <div
            key={purchase._id}
            onClick={() =>
              navigate(`/purchases/${purchase._id}`, {
                state: { purchase },
              })
            }
            className="border p-4 rounded cursor-pointer hover:shadow-md transition"
          >
            <h3 className="font-semibold text-lg">
              {purchase.listing?.title}
            </h3>

            <p className="text-sm text-gray-600">
              Category: {purchase.listing?.category}
            </p>

            <p className="text-green-600 font-bold mt-1">
              ₹{purchase.price}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Purchased on:{" "}
              {new Date(purchase.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyPurchases;
