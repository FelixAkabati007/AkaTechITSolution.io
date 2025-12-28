import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { localDataService } from "@lib/localData";
import { io } from "socket.io-client";
import { useToast } from "@components/ui/ToastProvider";
import { jsPDF } from "jspdf";

export const AdminBilling = () => {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    projectId: "",
    amount: "",
    dueDate: "",
    status: "Sent",
    description: "", // Added description
  });
  const [projects, setProjects] = useState([]);

  // New States for Real-time & Audit
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [socketStatus, setSocketStatus] = useState("disconnected");

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/admin/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((inv) => ({
          uuid: inv.id, // Real ID for API calls
          id: inv.referenceNumber || inv.id, // Display ID
          projectId: inv.projectId,
          amount: parseFloat(inv.amount || 0),
          status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
          date: new Date(inv.createdAt).toLocaleDateString(),
          // Store date in format for input type="date"
          rawDueDate: inv.dueDate
            ? new Date(inv.dueDate).toISOString().split("T")[0]
            : "",
          dueDate: inv.dueDate
            ? new Date(inv.dueDate).toLocaleDateString()
            : "Pending",
          description: inv.description,
        }));
        setInvoices(mapped);
      } else {
        setInvoices(localDataService.getInvoices());
      }
    } catch (e) {
      console.error(e);
      setInvoices(localDataService.getInvoices());
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchAuditLogs(); // Fetch initial logs
    setProjects(localDataService.getProjects());

    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      setSocketStatus("connected");
      addToast("Real-time sync active", "success");
    });

    socket.on("disconnect", () => {
      setSocketStatus("disconnected");
      addToast("Real-time sync disconnected", "error");
    });

    socket.on("connect_error", () => {
      setSocketStatus("error");
    });

    socket.on("new_invoice_request", (newInv) => {
      addToast(`New invoice request from ${newInv.user.name}`, "info");
      fetchInvoices();
      fetchAuditLogs(); // Update logs
    });

    socket.on("invoice_paid", (inv) => {
      addToast(
        `Invoice ${inv.referenceNumber} paid by ${inv.user.name}`,
        "success"
      );
      fetchInvoices();
      fetchAuditLogs();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const resetForm = () => {
    setNewInvoice({
      projectId: "",
      amount: "",
      dueDate: "",
      status: "Sent",
      description: "",
    });
    setIsEditMode(false);
    setEditingId(null);
    setIsVerified(false);
  };

  const handleCreateOrUpdateInvoice = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = isEditMode
      ? `http://localhost:3001/api/admin/invoices/${editingId}`
      : "http://localhost:3001/api/admin/invoices";
    const method = isEditMode ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newInvoice),
      });

      if (res.ok) {
        addToast(
          isEditMode
            ? "Invoice updated successfully"
            : "Invoice created successfully",
          "success"
        );
        fetchInvoices();
        setIsModalOpen(false);
        resetForm();
      } else {
        const err = await res.json();
        addToast(err.error || "Operation failed", "error");
      }
    } catch (e) {
      console.error(e);
      addToast("An error occurred", "error");
    }
  };

  const handleDeleteInvoice = async (uuid) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3001/api/admin/invoices/${uuid}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        addToast("Invoice deleted", "success");
        fetchInvoices();
      } else {
        addToast("Failed to delete invoice", "error");
      }
    } catch (e) {
      addToast("Error deleting invoice", "error");
    }
  };

  const handleEditClick = (invoice) => {
    setNewInvoice({
      projectId: invoice.projectId,
      amount: invoice.amount,
      dueDate: invoice.rawDueDate,
      status: invoice.status,
    });
    setEditingId(invoice.uuid);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDownloadInvoice = (invoice) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("AkaTech IT Solutions", 10, 20);
      doc.setFontSize(14);
      doc.text("INVOICE", 10, 40);
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${invoice.id}`, 10, 50);
      doc.text(`Date: ${invoice.date}`, 10, 60);
      doc.text(`Due Date: ${invoice.dueDate}`, 10, 70);
      const project = getProjectTitle(invoice.projectId);
      doc.text(`Project: ${project}`, 10, 80);
      doc.text(`Amount: GH₵ ${invoice.amount.toFixed(2)}`, 10, 100);
      doc.text(`Status: ${invoice.status}`, 10, 110);
      doc.save(`Invoice-${invoice.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const getProjectTitle = (id) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.title : "Unknown Project";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
          Financial Management
          <span
            className={`flex h-3 w-3 rounded-full ${
              socketStatus === "connected"
                ? "bg-green-500"
                : socketStatus === "error"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
            title={`Sync Status: ${socketStatus}`}
          />
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-2 rounded"
          >
            <Icons.History className="w-4 h-4" />{" "}
            {showAuditLogs ? "Hide Logs" : "Audit Logs"}
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2 rounded"
          >
            <Icons.Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      {showAuditLogs && (
        <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <h3 className="font-bold text-gray-900 dark:text-white">
              System Audit Logs
            </h3>
          </div>
          <div className="max-h-60 overflow-y-auto p-4 space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No logs available.
              </p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="text-sm border-b border-gray-100 dark:border-white/5 last:border-0 pb-2"
                >
                  <span className="font-mono text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="mx-2 font-bold text-akatech-gold">
                    {log.action}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    by {log.performedBy || "System"}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 pl-4 mt-1">
                    {JSON.stringify(JSON.parse(log.details || "{}"))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Invoice ID
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Project
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {getProjectTitle(invoice.projectId)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                    GH₵ {invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : invoice.status === "Overdue"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(invoice)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.uuid)}
                        className={`transition-colors ${
                          invoice.status === "Paid"
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-400 hover:text-red-500"
                        }`}
                        title={
                          invoice.status === "Paid"
                            ? "Cannot delete paid invoice"
                            : "Delete"
                        }
                        disabled={invoice.status === "Paid"}
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="text-gray-400 hover:text-akatech-gold transition-colors"
                        title="Download"
                      >
                        <Icons.Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-akatech-card w-full max-w-lg rounded-lg shadow-xl p-6 border border-gray-200 dark:border-white/10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {isEditMode ? "Edit Invoice" : "Create New Invoice"}
            </h3>
            <form
              onSubmit={handleCreateOrUpdateInvoice}
              className="space-y-4"
              aria-label="create-invoice-form"
            >
              <div>
                <label
                  htmlFor="invoiceProject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Project
                </label>
                <select
                  id="invoiceProject"
                  required={!newInvoice.projectId} // If projectId is null (Project Type Request), allow it to stay null if we don't want to force assignment yet? Actually, admins should probably assign it to a real project or keep it as is. But for now let's keep it required if we want standard behavior.
                  // However, if it came in as a request with projectId=null, we might want to let admin assign it.
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newInvoice.projectId || ""}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, projectId: e.target.value })
                  }
                >
                  <option value="">Select a Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                {/* If projectId is missing but we have a description, it might be a new project request type */}
                {!newInvoice.projectId && newInvoice.description && (
                  <p className="text-xs text-yellow-600 mt-1">
                    * This might be a generic request. Please assign a project
                    if applicable.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="invoiceAmount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Amount (GH₵)
                </label>
                <input
                  id="invoiceAmount"
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newInvoice.amount}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, amount: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="invoiceDueDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Due Date
                </label>
                <input
                  id="invoiceDueDate"
                  type="date"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newInvoice.dueDate}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="invoiceStatus"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Status
                </label>
                <select
                  id="invoiceStatus"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newInvoice.status}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, status: e.target.value })
                  }
                >
                  <option value="Requested">Requested</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Description / Request Details Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description / Request Details
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none min-h-[100px]"
                  value={newInvoice.description || ""}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      description: e.target.value,
                    })
                  }
                  placeholder="Invoice details or client request message..."
                />
              </div>

              {/* Verification Checkbox for Requests/Approvals */}
              {(newInvoice.status === "Paid" ||
                newInvoice.status === "Sent") && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <input
                    type="checkbox"
                    id="verifyTransaction"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 text-akatech-gold border-gray-300 rounded focus:ring-akatech-gold"
                  />
                  <label
                    htmlFor="verifyTransaction"
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    I have verified the transaction details and project
                    deliverables.
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    (newInvoice.status === "Paid" ||
                      newInvoice.status === "Sent") &&
                    !isVerified
                  }
                  className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                    (newInvoice.status === "Paid" ||
                      newInvoice.status === "Sent") &&
                    !isVerified
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-akatech-gold text-white hover:bg-akatech-goldDark"
                  }`}
                >
                  {isEditMode ? "Update Invoice" : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
