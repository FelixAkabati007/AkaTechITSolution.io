import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { useToast } from "@components/ui/ToastProvider";

export const AdminNotifications = () => {
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
      // Update local state
      setInbox((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error("Error marking all as read", e);
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

      if (res.ok) {
        addToast("Notification sent successfully", "success");
        setFormData({
          recipientId: "all",
          title: "",
          message: "",
          type: "info",
        });
        fetchHistory();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to send notification", "error");
      }
    } catch (error) {
      addToast("Error sending notification", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-2">
            Notifications
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage system alerts and client communications.
          </p>
        </div>
        {/* Tabs */}
        <div className="flex space-x-2 bg-gray-100 dark:bg-white/5 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "inbox"
                ? "bg-white dark:bg-akatech-primary text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icons.Inbox className="w-4 h-4" />
            Inbox
            {inbox.filter((n) => !n.read).length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">
                {inbox.filter((n) => !n.read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "compose"
                ? "bg-white dark:bg-akatech-primary text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icons.Send className="w-4 h-4" />
            Compose & History
          </button>
        </div>
      </div>

      {activeTab === "inbox" ? (
        <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm min-h-[400px]">
          <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.Bell className="w-5 h-5 text-akatech-gold" />
              System Alerts
            </h3>
            {inbox.some((n) => !n.read) && (
              <button
                onClick={markAllRead}
                className="text-sm text-akatech-primary hover:text-akatech-gold transition-colors font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {inboxLoading ? (
            <div className="flex justify-center items-center h-64">
              <Icons.Loader className="w-8 h-8 animate-spin text-akatech-gold" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-white/10">
              {inbox.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Icons.Inbox className="w-12 h-12 mb-4 opacity-20" />
                  <p>No notifications</p>
                </div>
              ) : (
                inbox.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 flex gap-4 cursor-pointer ${
                      !n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                    }`}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    <div
                      className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                        !n.read ? "bg-akatech-primary" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className={`font-medium ${
                            !n.read
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {n.title}
                        </h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
                      <Icons.Send className="w-4 h-4" /> Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* History */}
          <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 p-6 shadow-sm flex flex-col h-[600px]">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Icons.Clock className="w-5 h-5 text-gray-400" />
              Recent History
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Icons.Bell className="w-12 h-12 mb-4 opacity-20" />
                  <p>No notifications sent yet.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                  >
                    <div className="flex justify-between items-start mb-2">
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
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
