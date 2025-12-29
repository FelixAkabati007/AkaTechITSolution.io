import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icons } from "@components/ui/Icons";
import { jsPDF } from "jspdf";
import { useToast } from "@components/ui/ToastProvider";
import { useSyncStatus } from "@components/ui/SyncStatusProvider";
import { PROJECT_TYPES } from "../../lib/constants";

export const ClientBilling = ({ user }) => {
  const { addToast } = useToast();
  const { socket } = useSyncStatus();
  const [invoices, setInvoices] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [requestData, setRequestData] = useState({
    subject: "Invoice Request",
    message: "",
    projectId: "",
  });
  const [projects, setProjects] = useState([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentReference, setPaymentReference] = useState("");
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [projectOptions, setProjectOptions] = useState(PROJECT_TYPES);
  const [bankDetails, setBankDetails] = useState({
    bankName: "Standard Chartered",
    accountName: "AkaTech Solutions",
    accountNumber: "1234567890",
    branch: "Osu",
    mobileMoneyNumber: "0244027477",
    mobileMoneyName: "Felix Akabati",
  });

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [invRes, projRes, settingsRes] = await Promise.all([
        fetch("/api/client/invoices", { headers }),
        fetch(`/api/client/projects?email=${user.email}`, { headers }),
        fetch("/api/settings"),
      ]);

      if (!invRes.ok) {
        throw new Error("Failed to fetch invoices");
      }

      if (!projRes.ok) {
        console.warn("Failed to fetch projects");
      }

      const invData = await invRes.json();
      const projData = projRes.ok ? await projRes.json() : [];

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData && Object.keys(settingsData).length > 0) {
          setBankDetails(settingsData);
        }
      }

      const mapped = invData.map((inv) => {
        let status = inv.status.charAt(0).toUpperCase() + inv.status.slice(1);
        if (status === "Sent" || status === "Requested") status = "Unpaid";

        return {
          id: inv.referenceNumber || inv.id,
          projectId: inv.projectId,
          amount: parseFloat(inv.amount || 0),
          status: status,
          date: new Date(inv.createdAt).toLocaleDateString(),
          dueDate: inv.dueDate
            ? new Date(inv.dueDate).toLocaleDateString()
            : "Pending",
          description: inv.description,
        };
      });
      setInvoices(mapped);
      setProjects(projData);
    } catch (e) {
      console.error("Error fetching billing data:", e);
      addToast("Failed to load billing data. Please try again.", "error");
    }
  }, [user.email, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch("/api/projects/options")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch project options");
      })
      .then((data) => {
        if (data && Array.isArray(data)) {
          setProjectOptions(data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleInvoiceCreated = () => {
      fetchData();
      addToast("New invoice received", "info");
    };

    const handleInvoiceUpdated = () => {
      fetchData();
      addToast("Invoice updated", "info");
    };

    const handleProjectOptionsUpdated = (data) => {
      if (data && Array.isArray(data)) {
        setProjectOptions(data);
      }
    };

    socket.on("invoice_created", handleInvoiceCreated);
    socket.on("invoice_updated", handleInvoiceUpdated);
    socket.on("project_options_updated", handleProjectOptionsUpdated);

    return () => {
      socket.off("invoice_created", handleInvoiceCreated);
      socket.off("invoice_updated", handleInvoiceUpdated);
      socket.off("project_options_updated", handleProjectOptionsUpdated);
    };
  }, [socket, fetchData, addToast]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const projectTitle =
        projects.find((p) => p.id === inv.projectId)?.title ||
        inv.projectId ||
        "";
      const matchesSearch =
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.description &&
          inv.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus =
        filterStatus === "All" || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, filterStatus, projects]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDisplayProject = (invoice) => {
    if (invoice.projectId) {
      const p = projects.find((proj) => proj.id === invoice.projectId);
      if (p) return p.title;
    }
    const match = invoice.description?.match(/^\[Project Type: (.*?)\]/);
    return match ? match[1] : invoice.projectId || "Unknown Project";
  };

  const handleDownloadInvoice = (invoice) => {
    setIsDownloading(true);
    // Use setTimeout to allow the UI to update with the loading state before generating PDF
    setTimeout(() => {
      try {
        const doc = new jsPDF();

        // Add content to PDF
        doc.setFontSize(20);
        doc.text("AkaTech IT Solutions", 10, 20);

        doc.setFontSize(14);
        doc.text("INVOICE", 10, 40);

        doc.setFontSize(12);
        doc.text(`Invoice ID: ${invoice.id}`, 10, 50);
        doc.text(`Date: ${invoice.date}`, 10, 60);
        doc.text(`Due Date: ${invoice.dueDate}`, 10, 70);

        const project = getDisplayProject(invoice);
        doc.text(`Project: ${project}`, 10, 80);

        doc.text(`Amount: GH₵ ${invoice.amount.toFixed(2)}`, 10, 100);
        doc.text(`Status: ${invoice.status}`, 10, 110);

        // Save the PDF
        doc.save(`Invoice-${invoice.id}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        addToast("Failed to generate invoice PDF. Please try again.", "error");
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  const handleDeleteRequest = async (invoiceId) => {
    if (
      !window.confirm("Are you sure you want to delete this invoice request?")
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/client/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        addToast("Invoice request deleted successfully", "success");
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to delete request", "error");
      }
    } catch (e) {
      console.error("Delete error:", e);
      addToast("Error deleting request", "error");
    }
  };

  const handleEditRequest = (invoice) => {
    setEditingInvoiceId(invoice.id);
    setRequestData({
      subject: "Edit Invoice Request",
      message: invoice.description,
      projectId: invoice.projectId,
    });
    setIsModalOpen(true);
  };

  const handleRequestInvoice = async (e) => {
    e.preventDefault();
    if (!requestData.projectId) {
      addToast("Please select a project", "error");
      return;
    }
    if (!requestData.message.trim()) {
      addToast("Please provide details for the invoice", "error");
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const token = localStorage.getItem("token");

      // Determine if projectId is a real project ID or a project type string
      // If it's a project type, we set projectId to null and prepend type to message
      const isExistingProject = projects.some(
        (p) => p.id === requestData.projectId
      );

      let estimatedAmount = 0;
      if (!isExistingProject) {
        for (const cat of PROJECT_TYPES) {
          const item = cat.items.find((i) => i.name === requestData.projectId);
          if (item) {
            estimatedAmount = item.price;
            break;
          }
        }
      }

      const payload = {
        subject: requestData.subject,
        message: isExistingProject
          ? requestData.message
          : `[Project Type: ${requestData.projectId}]\n\n${requestData.message}`,
        projectId: isExistingProject ? requestData.projectId : null,
        amount: estimatedAmount,
      };

      let res;
      if (editingInvoiceId) {
        res = await fetch(`/api/client/invoices/${editingInvoiceId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/invoices/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        addToast(
          editingInvoiceId
            ? "Invoice request updated successfully!"
            : "Invoice request submitted successfully!",
          "success"
        );
        setIsModalOpen(false);
        setEditingInvoiceId(null);
        setRequestData({
          subject: "Invoice Request",
          message: "",
          projectId: "",
        });

        if (editingInvoiceId) {
          // Update local state for edit
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === editingInvoiceId
                ? {
                    ...inv,
                    description: payload.message,
                    projectId: payload.projectId || inv.projectId,
                  }
                : inv
            )
          );
        } else {
          // Add new for create
          const newInvoice = data.invoice;
          const mapped = {
            id: newInvoice.referenceNumber || newInvoice.id,
            projectId: newInvoice.projectId,
            amount: parseFloat(newInvoice.amount || 0),
            status:
              newInvoice.status.charAt(0).toUpperCase() +
              newInvoice.status.slice(1),
            date: new Date(newInvoice.createdAt).toLocaleDateString(),
            dueDate: "Pending",
            description: payload.message,
          };
          setInvoices((prev) => [mapped, ...prev]);
        }
      } else {
        addToast(data.error || "Failed to submit request", "error");
      }
    } catch (e) {
      addToast("Error submitting request", "error");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handlePayNow = (invoice) => {
    setPaymentInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const processPayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    // Validation
    if (paymentMethod === "momo") {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(paymentReference)) {
        addToast("Please enter a valid 10-digit mobile money number.", "error");
        setIsProcessingPayment(false);
        return;
      }
    } else if (paymentMethod === "bank") {
      if (!paymentReference || paymentReference.trim().length < 5) {
        addToast("Please enter a valid transaction reference.", "error");
        setIsProcessingPayment(false);
        return;
      }
    } else if (paymentMethod === "card") {
      if (
        !paymentDetails.cardNumber ||
        paymentDetails.cardNumber.length < 16 ||
        !paymentDetails.expiry ||
        !paymentDetails.cvv
      ) {
        addToast("Please enter valid card details.", "error");
        setIsProcessingPayment(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        method: paymentMethod,
        reference: paymentReference,
        details:
          paymentMethod === "card"
            ? {
                // PCI-DSS: Never send full card details to own server unless compliant.
                // Sending only non-sensitive data for record keeping.
                last4: paymentDetails.cardNumber.slice(-4),
                expiry: paymentDetails.expiry,
              }
            : paymentDetails,
      };

      const res = await fetch(`/api/client/invoices/${paymentInvoice.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state
        const updatedInvoices = invoices.map((inv) =>
          inv.id === paymentInvoice.id ? { ...inv, status: "Paid" } : inv
        );
        setInvoices(updatedInvoices);

        addToast("Payment successful!", "success");
        setIsPaymentModalOpen(false);
        setPaymentInvoice(null);
        setPaymentDetails({ cardNumber: "", expiry: "", cvv: "" });
        setPaymentReference("");
        setPaymentMethod("card");
      } else {
        addToast(data.error || "Payment failed", "error");
      }
    } catch (e) {
      console.error(e);
      addToast("Error processing payment", "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Unpaid":
      case "Sent": // Treat Sent as Unpaid for color
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Requested":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white flex items-center gap-3">
          Billing & Invoices
          <span
            className={`flex h-3 w-3 rounded-full ${
              socketStatus === "connected"
                ? "bg-green-500"
                : socketStatus === "error"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
            title={`Live Sync: ${socketStatus}`}
          />
        </h2>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
            {["All", "Paid", "Unpaid", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filterStatus === status
                    ? "bg-white dark:bg-akatech-card text-akatech-gold shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors focus:outline-none focus:ring-2 focus:ring-akatech-gold focus:ring-offset-2"
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
            aria-controls="request-invoice-modal"
          >
            Request Invoice
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          id="request-invoice-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white dark:bg-akatech-card p-6 rounded-lg w-full max-w-md">
            <h3
              id="modal-title"
              className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
            >
              {editingInvoiceId ? "Edit Invoice Request" : "Request Invoice"}
            </h3>
            <form onSubmit={handleRequestInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={requestData.subject}
                  onChange={(e) =>
                    setRequestData({ ...requestData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-akatech-card text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project
                </label>
                <select
                  required
                  value={requestData.projectId}
                  onChange={(e) =>
                    setRequestData({
                      ...requestData,
                      projectId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                >
                  <option
                    value=""
                    className="text-gray-900 bg-white dark:bg-akatech-card"
                  >
                    Select a project
                  </option>
                  {projects.length > 0 && (
                    <optgroup label="My Projects">
                      {projects.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          className="text-gray-900 bg-white dark:bg-akatech-card"
                        >
                          {p.title || p.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {projectOptions.map((cat) => (
                    <optgroup key={cat.category} label={cat.category}>
                      {cat.items.map((item) => (
                        <option
                          key={item.name}
                          value={item.name}
                          className="text-gray-900 bg-white dark:bg-akatech-card"
                        >
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message / Details
                </label>
                <textarea
                  required
                  placeholder="Please describe what you need an invoice for..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none h-32 resize-none"
                  value={requestData.message}
                  onChange={(e) =>
                    setRequestData({ ...requestData, message: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmittingRequest}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="px-4 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmittingRequest ? (
                    <>
                      <Icons.Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && paymentInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-akatech-card p-6 rounded-lg w-full max-w-md border border-gray-200 dark:border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.CreditCard className="w-5 h-5 text-akatech-gold" />
                Pay Invoice #{paymentInvoice.id}
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-100 dark:border-white/5">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 text-sm">Amount Due:</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  GH₵ {paymentInvoice.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Due Date: {paymentInvoice.dueDate}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              {["card", "momo", "bank"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-md border transition-all ${
                    paymentMethod === method
                      ? "border-akatech-gold bg-akatech-gold/10 text-akatech-gold"
                      : "border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  {method === "momo"
                    ? "Mobile Money"
                    : method === "bank"
                    ? "Bank Transfer"
                    : "Credit Card"}
                </button>
              ))}
            </div>

            <form onSubmit={processPayment} className="space-y-4">
              {paymentMethod === "card" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <Icons.CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="0000 0000 0000 0000"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                        value={paymentDetails.cardNumber}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            cardNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                        value={paymentDetails.expiry}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            expiry: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        maxLength="3"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                        value={paymentDetails.cvv}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            cvv: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === "momo" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                      Instructions
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Please send{" "}
                      <strong>GH₵ {paymentInvoice.amount.toFixed(2)}</strong> to
                      the following Mobile Money number:
                    </p>
                    <div className="my-3 font-mono text-lg font-bold text-center">
                      {bankDetails.mobileMoneyNumber}
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Name: {bankDetails.mobileMoneyName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Transaction ID / Reference
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Transaction ID"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-900/30">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2">
                      Bank Details
                    </h4>
                    <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      <p>
                        Bank: <strong>{bankDetails.bankName}</strong>
                      </p>
                      <p>
                        Account Name: <strong>{bankDetails.accountName}</strong>
                      </p>
                      <p>
                        Account Number:{" "}
                        <strong>{bankDetails.accountNumber}</strong>
                      </p>
                      <p>
                        Branch: <strong>{bankDetails.branch}</strong>
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Transaction Reference / Note
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Reference Number"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icons.Lock className="w-4 h-4" />
                      Proceed
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
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
                  Due Date
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Paid
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
              {currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {getDisplayProject(invoice)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {invoice.dueDate}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                      GH₵ {invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-green-600 dark:text-green-400">
                      GH₵{" "}
                      {(invoice.status === "Paid" ? invoice.amount : 0).toFixed(
                        2
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {(invoice.status === "Unpaid" ||
                        invoice.status === "Sent") && (
                        <button
                          onClick={() => handlePayNow(invoice)}
                          className="text-green-600 hover:text-green-900 font-bold text-xs uppercase"
                        >
                          Pay
                        </button>
                      )}
                      {invoice.status === "Requested" && (
                        <span
                          className="text-xs text-gray-500 italic mr-2"
                          title="Waiting for admin approval"
                        >
                          Pending Approval
                        </span>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="text-gray-400 hover:text-akatech-gold transition-colors"
                        title="Download"
                      >
                        <Icons.Download className="w-4 h-4" />
                      </button>
                      {(invoice.status === "Requested" ||
                        invoice.status === "Draft") && (
                        <>
                          <button
                            onClick={() => handleEditRequest(invoice)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Icons.Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(invoice.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <Icons.ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No invoices found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-white/10 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-white/10 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
