import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  // ⏳ auth state still loading
  if (authLoading) {
    return <p>Checking authentication...</p>;
  }

  // ❌ not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ logged in
  return children;
}

export default ProtectedRoute;
