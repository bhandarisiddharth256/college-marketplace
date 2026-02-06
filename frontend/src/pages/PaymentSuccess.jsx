import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold text-green-600 mb-2">
        Payment Successful 🎉
      </h1>

      <p className="text-gray-700 mb-6 text-center">
        Your payment was completed successfully.
        <br />
        The listing has been purchased.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/marketplace")}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Go to Marketplace
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="px-4 py-2 border rounded"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
