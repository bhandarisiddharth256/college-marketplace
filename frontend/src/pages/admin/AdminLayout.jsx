import { Link, Outlet} from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <div className="flex flex-col gap-4">
          <Link  to="/admin/dashboard">Dashboard</Link>
          <Link  to="/admin/users">Users</Link>
          <Link  to="/admin/listings">Listings</Link>
          <Link  to="/admin/reports">Reports</Link>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
