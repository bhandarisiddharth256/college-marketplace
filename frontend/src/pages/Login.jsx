import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth.api";
import { isCollegeEmail } from "../utils/validators";

function Login() {
  const { isAuthenticated, authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ⏳ Wait until auth state is checked
  if (authLoading) {
    return (
      <p className="text-center mt-10">Checking authentication...</p>
    );
  }

  // 🔁 Redirect if already logged in
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Email validation
    if (!isCollegeEmail(email)) {
      setError("Please use your college email ID (@college.edu)");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      // ✅ Save token + user in context
      login(res.data.token, res.data.user);

      // ✅ Redirect after login
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-10">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-600 mb-2">
            Welcome back
          </p>
          <h2 className="text-3xl font-semibold">Login to College Marketplace</h2>
        </div>

        {error && (
          <p className="mb-3 text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        {error && (
          <p className="mb-3 text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="College Email"
            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-full disabled:opacity-50 transition hover:bg-brand-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;