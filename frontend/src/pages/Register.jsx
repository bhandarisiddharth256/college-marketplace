import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/auth.api';
import { isCollegeEmail } from '../utils/validators';

function Register() {
  const { isAuthenticated, authLoading, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) return <p className="text-center mt-10">Checking authentication...</p>;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!college.trim()) {
        setError('College name is required');
        return;
    }

    if (!isCollegeEmail(email)) {
        setError('Please use your college email ID (@college.edu)');
        return;
    }

    setLoading(true);
    try {
        const res = await registerUser({
        name,
        college,
        email,
        password,
        });

        // ✅ token path is correct
        login(res.data.token);
        navigate('/');
    } catch (err) {
        // ✅ correct axios error path
        setError(err.response?.data?.message || 'Registration failed');
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>

        {error && (
          <p className="mb-3 text-red-600 text-sm text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="College Name"
            className="w-full border px-3 py-2 rounded"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="College Email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
