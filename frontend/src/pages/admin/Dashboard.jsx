import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/admin.api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data.data);
      } catch (err) {
        console.error("Stats fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-2xl font-bold">{stats.users}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Listings</p>
          <h2 className="text-2xl font-bold">{stats.listings}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Reported Messages</p>
          <h2 className="text-2xl font-bold">{stats.reportedMessages}</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
