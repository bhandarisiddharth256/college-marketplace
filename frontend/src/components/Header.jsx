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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="app-container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-slate-900">
          <div className="h-11 w-11 rounded-2xl bg-brand-600 text-white grid place-items-center shadow-lg">
            C
          </div>
          <div>
            <p className="text-lg font-semibold">CollegeMarketplace</p>
            <p className="text-xs text-slate-500">Campus trading made elegant</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link to="/" className="transition hover:text-brand-600">
            Home
          </Link>
          <Link to="/marketplace" className="transition hover:text-brand-600">
            Marketplace
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/messages" className="transition hover:text-brand-600">
                Messages
              </Link>
              <Link to="/my-listings" className="transition hover:text-brand-600">
                My Listings
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="h-11 min-w-[44px] rounded-full bg-brand-600 text-white font-semibold shadow-md transition hover:bg-brand-700"
              >
                {user.name?.charAt(0).toUpperCase()}
              </button>

              {open && (
                <div className="absolute right-0 top-14 w-64 rounded-3xl border border-slate-200 bg-white shadow-soft">
                  <div className="px-5 py-4 border-b border-slate-200">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>
                  <ul className="py-2 text-sm text-slate-700">
                    {user.role === "admin" && (
                      <li>
                        <Link
                          to="/admin"
                          onClick={() => setOpen(false)}
                          className="block px-5 py-3 transition hover:bg-slate-100 text-brand-600 font-semibold"
                        >
                          Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 transition hover:bg-slate-100"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/messages"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 transition hover:bg-slate-100"
                      >
                        Messages
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/my-listings"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 transition hover:bg-slate-100"
                      >
                        My Listings
                      </Link>
                    </li>
                  </ul>
                  <div className="border-t border-slate-200">
                    <button
                      onClick={handleLogout}
                      className="w-full px-5 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-slate-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate("/login")}
                className="secondary-button"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="primary-button"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
