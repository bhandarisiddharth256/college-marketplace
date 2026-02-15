import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-black text-white p-6">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <nav className="flex flex-col gap-4">
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/listings">Listings</NavLink>
        <NavLink to="/admin/reports">Reports</NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar;
