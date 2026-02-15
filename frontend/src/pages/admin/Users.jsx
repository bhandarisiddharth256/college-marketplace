import { useEffect, useState } from "react";
import { getAdminUsers } from "../../api/admin.api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getAdminUsers(page);
        setUsers(res.data.data);
        setFiltered(res.data.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  /* 🔍 Search filter */
  useEffect(() => {
    const f = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, users]);

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {/* Search */}
      <input
        placeholder="Search by name or email..."
        className="border p-2 rounded mb-4 w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Role</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>

                <td className="p-3 text-gray-600">{u.email}</td>

                {/* Role Badge */}
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-1 bg-black text-white rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="font-medium">Page {page}</span>

        <button
          disabled={users.length < 10}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-1 bg-black text-white rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Users;
