import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";
import { io } from "socket.io-client";
import { useToast } from "@components/ui/ToastProvider";
import { jsPDF } from "jspdf";
import { getApiUrl, getSocketUrl } from "@lib/config";

export const AdminBilling = () => {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    projectId: "",
    customProjectName: "",
    amount: "",
    dueDate: "",
    status: "Sent",
  });
  const [projects, setProjects] = useState([]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiUrl()}/admin/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((inv) => ({
          uuid: inv.id, // Real ID for API calls
          id: inv.referenceNumber || inv.id, // Display ID
          projectId: inv.projectId,
          customProjectName: inv.customProjectName,
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
        setInvoices(mockService.getInvoices());
      }
    } catch (e) {
      console.error(e);
      setInvoices(mockService.getInvoices());
    }
  };

  useEffect(() => {
    fetchInvoices();
    setProjects(mockService.getProjects());

    const socket = io(getSocketUrl());
    socket.on("new_invoice_request", (newInv) => {
      addToast(`New invoice request from ${newInv.user.name}`, "info");
      fetchInvoices(); // Refresh list
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const resetForm = () => {
    setNewInvoice({
      projectId: "",
      customProjectName: "",
      amount: "",
      dueDate: "",
      status: "Sent",
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleCreateOrUpdateInvoice = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = isEditMode
      ? `${getApiUrl()}/admin/invoices/${editingId}`
      : `${getApiUrl()}/admin/invoices`;
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
      const res = await fetch(`${getApiUrl()}/admin/invoices/${uuid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
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
      projectId: invoice.projectId || "others",
      customProjectName: invoice.customProjectName || "",
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 25.4; // 1 inch in mm

      const logoUrl = "/logo.png";
      const img = new Image();
      img.src = logoUrl;

      const generatePDF = (withLogo = false) => {
        try {
          let y = 20; // Top margin

          // Logo
          if (withLogo) {
            const logoHeight = 21; // ~80px height
            const logoWidth = (img.width / img.height) * logoHeight;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(img, "PNG", logoX, y, logoWidth, logoHeight);
            y += logoHeight + 15;
          } else {
            y += 20;
          }

          // Company Name
          doc.setFontSize(10);
          doc.setTextColor(50, 50, 50);
          doc.text("AkaTech IT Solutions", margin, y);

          // INVOICE Title
          doc.setFontSize(24);
          doc.setTextColor(197, 160, 89); // Akatech Gold
          doc.setFont("helvetica", "bold");
          doc.text("INVOICE", pageWidth - margin, y, { align: "right" });

          y += 10;

          // Divider
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageWidth - margin, y);
          y += 10;

          // Invoice Details
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);

          const rightColX = pageWidth - margin - 40;

          // Left Column (Bill To)
          doc.text("Bill To:", margin, y);
          doc.setFont("helvetica", "bold");
          doc.text(getProjectTitle(invoice), margin, y + 5);
          doc.setFont("helvetica", "normal");

          // Right Column (Invoice Meta)
          doc.text("Invoice ID:", rightColX, y);
          doc.text(invoice.id, pageWidth - margin, y, { align: "right" });

          doc.text("Date:", rightColX, y + 5);
          doc.text(invoice.date, pageWidth - margin, y + 5, { align: "right" });

          doc.text("Due Date:", rightColX, y + 10);
          doc.text(invoice.dueDate, pageWidth - margin, y + 10, {
            align: "right",
          });

          y += 25;

          // Table Header
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.text("Description", margin + 2, y + 5);
          doc.text("Amount", pageWidth - margin - 2, y + 5, { align: "right" });

          y += 15;

          // Table Row
          doc.setFont("helvetica", "normal");
          doc.text(invoice.description || "Project Services", margin + 2, y);
          doc.text(
            `GH₵ ${invoice.amount.toFixed(2)}`,
            pageWidth - margin - 2,
            y,
            { align: "right" }
          );

          y += 10;
          doc.line(margin, y, pageWidth - margin, y);

          y += 10;

          // Total
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Total:", pageWidth - margin - 40, y);
          doc.setTextColor(197, 160, 89);
          doc.text(
            `GH₵ ${invoice.amount.toFixed(2)}`,
            pageWidth - margin - 2,
            y,
            { align: "right" }
          );

          // Status Badge (Simple Text for PDF)
          y += 15;
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Status: ${invoice.status}`, margin, y);

          doc.save(`Invoice-${invoice.id}.pdf`);
        } catch (err) {
          console.error(err);
          addToast("Error generating PDF content", "error");
        }
      };

      img.onload = () => generatePDF(true);
      img.onerror = () => generatePDF(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      addToast("Failed to generate PDF", "error");
    }
  };

  const getProjectTitle = (invoice) => {
    if (invoice.projectId) {
      const project = projects.find((p) => p.id === invoice.projectId);
      return project ? project.title : "Unknown Project";
    }
    return invoice.customProjectName || "Unknown Project";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
          Financial Management
        </h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

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
                    {getProjectTitle(invoice)}
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
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newInvoice.projectId}
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
                  <option value="others">Others</option>
                </select>
              </div>

              {newInvoice.projectId === "others" && (
                <div>
                  <label
                    htmlFor="customProjectName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Custom Project Name
                  </label>
                  <input
                    id="customProjectName"
                    type="text"
                    required
                    placeholder="Enter project name"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                    value={newInvoice.customProjectName}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        customProjectName: e.target.value,
                      })
                    }
                  />
                </div>
              )}

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
                  className="px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors"
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
