import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { PRICING_PACKAGES } from "../../lib/data";
import { localDataService } from "@lib/localData";

const API_URL = "http://localhost:3001/api";

export const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [processingId, setProcessingId] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const currentToken = localStorage.getItem("adminToken");
      if (!currentToken) return;

      const res = await fetch(
        `${API_URL}/subscriptions?page=${page}&limit=${limit}&status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setSubscriptions(data.data);
      setTotal(data.total);
    } catch (err) {
      console.warn("API unavailable, switching to offline mode:", err.message);
      // Fallback to local data
      const localData = localDataService.getSubscriptions();
      setSubscriptions(localData);
      setTotal(localData.length);
      // showNotification("Running in offline mode", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();

    // Listen for updates from other tabs/windows if needed,
    // but main sync comes from API fetch on mount/update.
  }, [page, statusFilter]);

  const handleApprove = async (sub) => {
    if (processingId === sub.id) return;
    setProcessingId(sub.id);

    try {
      const currentToken = localStorage.getItem("adminToken");

      // 1. Approve Subscription
      const res = await fetch(`${API_URL}/subscriptions/${sub.id}/action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) throw new Error("Approval failed");

      const data = await res.json();
      const project = data.project;

      // 2. Generate Invoice (Automated with Retries)
      if (project) {
        let attempts = 0;
        const maxAttempts = 3;
        let invoiceCreated = false;

        while (attempts < maxAttempts && !invoiceCreated) {
          try {
            // 30s timeout signal
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const invRes = await fetch(`${API_URL}/invoices/generate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentToken}`,
              },
              body: JSON.stringify({
                userId: sub.userId,
                projectId: project.id,
                plan: sub.plan,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (invRes.ok) {
              const invData = await invRes.json();
              showNotification(
                `Approved & Invoice ${invData.referenceNumber} generated`,
                "success"
              );
              invoiceCreated = true;
            } else {
              throw new Error("Invoice generation failed");
            }
          } catch (e) {
            attempts++;
            console.error(`Invoice generation attempt ${attempts} failed:`, e);
            if (attempts === maxAttempts) {
              showNotification(
                "Approved but invoice generation failed. Please try manually.",
                "error"
              );
            } else {
              // Exponential backoff: 1s, 2s, 4s...
              await new Promise((r) =>
                setTimeout(r, Math.pow(2, attempts) * 1000)
              );
            }
          }
        }
      } else {
        showNotification("Approved (No Project Created)", "success");
      }

      fetchSubscriptions();
    } catch (err) {
      showNotification(err.message || "Error approving subscription", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAction = async (id, action, details = {}) => {
    try {
      const currentToken = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/subscriptions/${id}/action`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ action, details }),
      });

      if (!res.ok) throw new Error("Action failed");

      const actionPastTense =
        {
          approve: "approved",
          reject: "rejected",
          cancel: "cancelled",
          extend: "extended",
        }[action] || `${action}d`;

      showNotification(`Subscription ${actionPastTense} successfully`);
      fetchSubscriptions();
    } catch (err) {
      showNotification("Error performing action", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = async () => {
    try {
      const data = localDataService.getSubscriptions();
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["User,Email,Plan,Status,Start Date,End Date,Amount"]
          .concat(
            data.map(
              (s) =>
                `${s.userName},${s.userEmail},${s.plan},${s.status},${s.startDate},${s.endDate},"${s.amount}"`
            )
          )
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "subscriptions.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Export successful");
    } catch (err) {
      showNotification("Export failed", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanDetails = (planName) => {
    return PRICING_PACKAGES.find((p) => p.name === planName);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
          Subscription Management
        </h2>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2 rounded"
          >
            <Icons.Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            notification.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Plan Details
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const plan = getPlanDetails(sub.plan);
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {sub.userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sub.userEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {sub.plan}
                        </div>
                        <div className="text-xs text-gray-500">
                          {plan ? `GHS ${plan.price}` : sub.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        <div className="text-xs">
                          Start: {new Date(sub.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          End: {new Date(sub.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {sub.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(sub)}
                              disabled={processingId === sub.id}
                              className={`font-bold text-xs uppercase flex items-center gap-1 ${
                                processingId === sub.id
                                  ? "text-gray-400"
                                  : "text-green-600 hover:text-green-900"
                              }`}
                            >
                              {processingId === sub.id && (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              )}
                              {processingId === sub.id
                                ? "Processing"
                                : "Approve"}
                            </button>
                            <button
                              onClick={() => handleAction(sub.id, "reject")}
                              className="text-red-600 hover:text-red-900 font-bold text-xs uppercase"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {sub.status === "active" && (
                          <>
                            <button
                              onClick={() =>
                                handleAction(sub.id, "extend", { months: 1 })
                              }
                              className="text-blue-600 hover:text-blue-900 font-bold text-xs uppercase"
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => handleAction(sub.id, "cancel")}
                              className="text-red-600 hover:text-red-900 font-bold text-xs uppercase"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {(sub.status === "cancelled" ||
                          sub.status === "expired") && (
                          <span className="text-gray-400 text-xs italic">
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{" "}
          {total} results
        </div>
        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
