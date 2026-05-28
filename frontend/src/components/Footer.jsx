import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300 mt-16">
      <div className="app-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-xl font-semibold text-white">CollegeMarketplace</h3>
          <p className="mt-3 text-sm text-slate-400 leading-6">
            A premium campus marketplace for students to buy, sell, and connect in a trusted environment.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Explore</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/marketplace" className="transition hover:text-white">
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/messages" className="transition hover:text-white">
                Messages
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Account</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/profile" className="transition hover:text-white">
                Profile
              </Link>
            </li>
            <li>
              <Link to="/my-listings" className="transition hover:text-white">
                My Listings
              </Link>
            </li>
            <li>
              <Link to="/sales" className="transition hover:text-white">
                My Sales
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Why choose us</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>Secure campus payments</li>
            <li>Verified student community</li>
            <li>Fast, reliable messaging</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 text-center py-5 text-xs text-slate-500">
        © {new Date().getFullYear()} CollegeMarketplace. Crafted for campus commerce.
      </div>
    </footer>
  );
}

export default Footer;
