import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link to="/" className="text-2xl font-bold text-indigo-600">
          College<span className="text-black">Marketplace</span>
        </Link>

        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>

          {isAuthenticated && (
            <>
              <Link to="/messages">Messages</Link>
              <Link to="/my-listings">My Listings</Link>
            </>
          )}
        </nav>

        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center"
            >
              {user.name?.charAt(0).toUpperCase()}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white border rounded-lg shadow-lg z-50">

                <div className="px-4 py-3 border-b">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <ul className="py-2 text-sm text-gray-700">

                  {/* ADMIN PANEL BUTTON */}
                  {user.role === "admin" && (
                    <li>
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-100 font-semibold text-indigo-600"
                      >
                        Admin Panel
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-gray-100">
                      Profile
                    </Link>
                  </li>

                  <li>
                    <Link to="/messages" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-gray-100">
                      Messages
                    </Link>
                  </li>

                  <li>
                    <Link to="/my-listings" onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-gray-100">
                      My Listings
                    </Link>
                  </li>
                </ul>

                <div className="border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>

              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => navigate("/login")} className="px-4 py-2 border rounded">
              Login
            </button>
            <button onClick={() => navigate("/register")} className="px-4 py-2 bg-indigo-600 text-white rounded">
              Register
            </button>
          </div>
        )}

      </div>
    </header>
  );
}

export default Header;
