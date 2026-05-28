import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="card max-w-2xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-semibold text-emerald-600 mb-4">
          Payment Successful 🎉
        </h1>
        <p className="text-slate-700 mb-8 leading-relaxed">
          Your payment was completed successfully. The listing has been purchased and the seller will be notified.
        </p>

      <p className="text-gray-700 mb-6 text-center">
        Your payment was completed successfully.
        <br />
        The listing has been purchased.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => navigate("/marketplace")}
          className="rounded-full bg-brand-600 text-white px-6 py-3 transition hover:bg-brand-700"
        >
          Go to Marketplace
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="rounded-full border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-100"
        >
          View Profile
        </button>
      </div>
    </div>
    </div>
  );
}

export default PaymentSuccess;
