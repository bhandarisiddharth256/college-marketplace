import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeFromCart } from "../api/cart.api";
import { createOrder, verifyPayment } from "../api/payment.api";

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await getCart();
      const cartItems = res.data || [];

      const activeCart = cartItems.filter(
        (item) => item.listing.status !== "sold",
      );

      setItems(activeCart);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartItemId, e) => {
    e.stopPropagation();
    try {
      await removeFromCart(cartItemId);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove item");
    }
  };

  // 💰 PER LISTING BUY
  const handleBuy = async (listingId, e) => {
    e.stopPropagation();

    // ⛔ HARD BLOCK
    if (payingId) {
      console.log("⚠️ Another payment already in progress");
      return;
    }

    try {
      setPayingId(listingId);
      console.log("🟡 Buying listing:", listingId);

      const res = await createOrder(listingId);
      console.log("✅ Razorpay order created:", res.data);

      // 🚀 OPEN RAZORPAY
      await openRazorpay(res.data.data);
    } catch (err) {
      console.error("❌ Payment init failed", err);
      alert(err.response?.data?.message || "Payment failed");

      // only reset on failure
      setPayingId(null);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        console.log("✅ Razorpay script loaded");
        resolve(true);
      };

      script.onerror = () => {
        console.error("❌ Razorpay script failed to load");
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const openRazorpay = async (order) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load");
      setPayingId(null);
      return;
    }

    console.log("🧾 Opening Razorpay with order:", order.id);
    console.log("Razorpay Key:", import.meta.env.VITE_RAZORPAY_KEY_ID)
    
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ FIXED
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,

      name: "College Marketplace",
      description: "Listing Purchase",

      handler: async (response) => {
        console.log("✅ Razorpay success:", response);

        try {
          console.log("📡 Verifying payment on backend");
          const verifyRes = await verifyPayment(response);

          console.log("🎉 Payment verified:", verifyRes.data);

          // 🔁 REFRESH CART AFTER SUCCESS
          await fetchCart();

          navigate("/payment/success");
        } catch (err) {
          console.error("❌ Verification failed", err);
          alert("Payment verification failed");
        } finally {
          setPayingId(null);
        }
      },

      modal: {
        ondismiss: () => {
          console.log("⚠️ Razorpay popup dismissed");
          setPayingId(null);
        },
      },
      theme: { color: "#000000" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) return <p className="p-6">Loading cart...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="card max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold">Cart</h2>
          <p className="text-slate-500 mt-1">Review your selected items and complete checkout securely.</p>
        </div>

      {items.length === 0 && <p>Your cart is empty.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item._id}
            onClick={() => navigate(`/listings/${item.listing._id}`)}
            className="border p-4 rounded shadow-sm cursor-pointer hover:shadow-md transition"
          >
            <h3 className="font-semibold text-lg">{item.listing.title}</h3>

            <p className="text-sm text-gray-600">
              Category: {item.listing.category}
            </p>

            <p className="text-blue-600 font-bold mt-1">
              ₹{item.listing.price}
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={(e) => handleRemove(item._id, e)}
                className="rounded-full bg-red-600 text-white px-4 py-2 text-sm font-semibold transition hover:bg-red-700"
              >
                Remove
              </button>

              <button
                onClick={(e) => handleBuy(item.listing._id, e)}
                disabled={payingId === item.listing._id}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                  payingId === item.listing._id
                    ? "bg-slate-300 cursor-not-allowed text-slate-600"
                    : "bg-brand-600 hover:bg-brand-700"
                }`}
              >
                {payingId === item.listing._id ? "Processing..." : "Buy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default Cart;
