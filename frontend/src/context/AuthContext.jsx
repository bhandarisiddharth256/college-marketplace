import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
    }

    setAuthLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ✅ ADD THIS
    setToken(null);
    setUser(null); // ✅ ADD THIS
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/users/me", { timeout: 15000 }); // wait 15s
        setUser(res.data.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Only clear auth on 401, not network/timeout errors
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Network error / timeout / Render cold start — keep user logged in
          const storedUser = localStorage.getItem("user");
          try {
            if (storedUser) setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } catch {
            // corrupt JSON in localStorage
            localStorage.removeItem("user");
            setIsAuthenticated(false);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        authLoading,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
