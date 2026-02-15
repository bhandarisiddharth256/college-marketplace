import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t bg-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-600">

        {/* BRAND */}
        <div>
          <h3 className="text-lg font-semibold text-indigo-600">
            CollegeMarketplace
          </h3>
          <p className="mt-2">
            Buy & sell items inside your college community securely.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Explore</h4>
          <ul className="space-y-2">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/marketplace">Marketplace</Link></li>
            <li><Link to="/messages">Messages</Link></li>
          </ul>
        </div>

        {/* ACCOUNT */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Account</h4>
          <ul className="space-y-2">
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/my-listings">My Listings</Link></li>
            <li><Link to="/sales">My Sales</Link></li>
          </ul>
        </div>

        {/* INFO */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Info</h4>
          <p>Secure payments</p>
          <p>Verified users</p>
          <p>24/7 support</p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} CollegeMarketplace. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
