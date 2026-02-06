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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          College<span className="text-black">Marketplace</span>
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
          <Link to="/marketplace" className="hover:text-indigo-600">
            Marketplace
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/messages" className="hover:text-indigo-600">
                Messages
              </Link>
              <Link to="/my-listings" className="hover:text-indigo-600">
                My Listings
              </Link>
            </>
          )}
        </nav>

        {/* RIGHT SIDE */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            {/* AVATAR */}
            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center"
            >
              {user.name?.charAt(0).toUpperCase()}
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white border rounded-lg shadow-lg z-50">
                {/* USER INFO */}
                <div className="px-4 py-3 border-b">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                {/* LINKS */}
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/marketplace"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Marketplace
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/messages"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/my-listings"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Listings
                    </Link>
                  </li>
                </ul>

                {/* LOGOUT */}
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
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
