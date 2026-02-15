import { useEffect, useState } from "react";
import {
  getReportedMessages,
  deleteReportedMessage,
} from "../../api/admin.api";

const Reports = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await getReportedMessages();
      setMessages(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteReportedMessage(confirmId);
      setConfirmId(null);
      fetchReports();
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reported Messages</h1>

      {messages.length === 0 && (
        <p className="text-gray-500">No reported messages.</p>
      )}

      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m._id}
            className="bg-white p-4 rounded shadow flex justify-between items-start"
          >
            <div>
              <p className="font-medium">{m.sender?.email}</p>
              <p className="text-gray-700 mt-1">{m.text}</p>
            </div>

            <button
              onClick={() => setConfirmId(m._id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="font-semibold mb-4">
              Delete this message?
            </h3>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
