import React, { useState, useEffect, useMemo } from "react";
import { Icons } from "@components/ui/Icons";
import { useToast } from "@components/ui/ToastProvider";

const AdminNotifications = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("inbox"); // 'inbox' | 'compose'
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Compose State
  const [formData, setFormData] = useState({
    recipientId: "all", // 'all' or specific user ID
    title: "",
    message: "",
    type: "info", // info, success, warning, error
  });
  const [history, setHistory] = useState([]);

  // Inbox State
  const [inbox, setInbox] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchHistory();
    fetchInbox();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching notification history:", error);
    }
  };

  const fetchInbox = async () => {
    setInboxLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInbox(data);
      }
    } catch (error) {
      console.error("Error fetching inbox:", error);
    } finally {
      setInboxLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state
      setInbox((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error("Error marking as read", e);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setInbox((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast("All notifications marked as read", "success");
    } catch (e) {
      console.error("Error marking all as read", e);
      addToast("Failed to mark all as read", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send notification");

      addToast("Notification sent successfully", "success");
      setFormData({
        recipientId: "all",
        title: "",
        message: "",
        type: "info",
      });
      fetchHistory(); // Refresh history
      setActiveTab("inbox"); // Go back to inbox/history
    } catch (error) {
      console.error("Error sending notification:", error);
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const combinedNotifications = useMemo(() => {
    const all = [...inbox, ...history];
    // Deduplicate by ID
    const uniqueMap = new Map();
    all.forEach((item) => {
      if (item.id) uniqueMap.set(item.id, item);
      else uniqueMap.set(Math.random(), item); // Fallback for missing IDs
    });
    const unique = Array.from(uniqueMap.values());
    // Sort by date (newest first)
    return unique.sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp) -
        new Date(a.createdAt || a.timestamp)
    );
  }, [inbox, history]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications Center
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and send notifications to users
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "inbox"
                ? "bg-akatech-gold text-white"
                : "bg-white dark:bg-akatech-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10"
            }`}
          >
            Inbox & History
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "compose"
                ? "bg-akatech-gold text-white"
                : "bg-white dark:bg-akatech-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10"
            }`}
          >
            Compose New
          </button>
        </div>
      </div>

      {activeTab === "inbox" ? (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex justify-between items-center bg-white dark:bg-akatech-card p-4 rounded-lg border border-gray-200 dark:border-white/10">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button
              onClick={markAllRead}
              className="text-sm text-akatech-gold hover:text-akatech-goldDark font-medium"
            >
              Mark all as read
            </button>
          </div>

          {/* Inbox List */}
          <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
            {inboxLoading ? (
              <div className="p-8 flex justify-center">
                <Icons.Loader className="w-8 h-8 animate-spin text-akatech-gold" />
              </div>
            ) : combinedNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No notifications found
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-white/10">
                {combinedNotifications.slice(0, 50).map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                      !item.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.type === "error"
                            ? "bg-red-100 text-red-600"
                            : item.type === "warning"
                            ? "bg-orange-100 text-orange-600"
                            : item.type === "success"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {item.message}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Icons.Users className="w-3 h-3" />
                        {item.recipientId === "all"
                          ? "Broadcast"
                          : "Single User"}
                      </span>
                      <span>
                        {new Date(
                          item.createdAt || item.timestamp
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Notification Form */}
          <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Icons.Send className="w-5 h-5 text-akatech-gold" />
              Compose Notification
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={formData.recipientId}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientId: e.target.value })
                  }
                >
                  <option value="all">All Clients (Broadcast)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <div className="flex gap-4">
                  {["info", "success", "warning", "error"].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="text-akatech-gold focus:ring-akatech-gold"
                      />
                      <span className="capitalize text-sm text-gray-700 dark:text-gray-300">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., System Maintenance Update"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none resize-none"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Type your message here..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Icons.Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Icons.Send className="w-4 h-4" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
