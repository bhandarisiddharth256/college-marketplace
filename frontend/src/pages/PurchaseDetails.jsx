import { useLocation, useNavigate } from "react-router-dom";

function PurchaseDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const purchase = state?.purchase;

  if (!purchase) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="card max-w-3xl mx-auto p-6">
          <p className="text-red-600">
          Purchase data not available. Please go back.
        </p>
        <button
          onClick={() => navigate("/purchases")}
          className="mt-4 px-4 py-2 bg-black text-white rounded"
        >
          Go to My Purchases
        </button>
      </div>
      </div>
    );
  }

  const { listing } = purchase;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="card max-w-3xl mx-auto p-6">
        <h2 className="text-3xl font-semibold mb-4">Purchase Details</h2>

        <div className="border border-slate-200 rounded-3xl p-6 bg-white shadow-sm">
        <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>

        <p className="text-sm text-gray-600">Category: {listing.category}</p>

        <p className="text-green-600 font-bold mt-2">
          Price Paid: ₹{purchase.price}
        </p>

        <p className="text-sm mt-2">Seller Name: {purchase.seller?.name}</p>

        <p className="text-sm text-gray-600">
          Seller College: {purchase.seller?.college}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Purchased on: {new Date(purchase.createdAt).toLocaleString()}
        </p>

        <span className="inline-block mt-3 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
          Purchased
        </span>
      </div>
      </div>
      <button
        onClick={() => navigate("/marketplace")}
        className="mt-6 px-4 py-2 bg-black text-white rounded"
      >
        Go to Marketplace
      </button>
    </div>
  );
}

export default PurchaseDetails;
