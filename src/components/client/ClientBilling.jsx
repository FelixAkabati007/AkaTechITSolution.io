import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { jsPDF } from "jspdf";
import { useToast } from "@components/ui/ToastProvider";

export const ClientBilling = ({ user }) => {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
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
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [invRes, projRes] = await Promise.all([
          fetch("/api/client/invoices", { headers }),
          fetch(`/api/client/projects?email=${user.email}`, { headers }),
        ]);

        if (!invRes.ok) {
          throw new Error("Failed to fetch invoices");
        }

        if (!projRes.ok) {
          // Projects might be optional or handleable, but let's log it.
          console.warn("Failed to fetch projects");
        }

        const invData = await invRes.json();
        const projData = projRes.ok ? await projRes.json() : [];

        const mapped = invData.map((inv) => {
          let status = inv.status.charAt(0).toUpperCase() + inv.status.slice(1);
          // Map technical statuses to user-friendly ones
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
        setFilteredInvoices(mapped);
        setProjects(projData);
      } catch (e) {
        console.error("Error fetching billing data:", e);
        addToast("Failed to load billing data. Please try again.", "error");
      }
    };
    fetchData();
  }, [user.id, user.email, addToast]);

  useEffect(() => {
    if (filterStatus === "All") {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(
        invoices.filter((inv) => inv.status === filterStatus)
      );
    }
  }, [filterStatus, invoices]);

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

        const project =
          projects.find((p) => p.id === invoice.projectId)?.title ||
          "Unknown Project";
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
      const res = await fetch("/api/invoices/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: requestData.subject,
          message: requestData.message,
          projectId: requestData.projectId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Invoice request submitted successfully!", "success");
        setIsModalOpen(false);
        setRequestData({
          subject: "Invoice Request",
          message: "",
          projectId: "",
        });

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
          description: requestData.message,
        };
        setInvoices((prev) => [mapped, ...prev]);
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

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/client/invoices/${paymentInvoice.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          method: paymentMethod,
          reference: paymentReference,
          details: paymentDetails,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state
        const updatedInvoices = invoices.map((inv) =>
          inv.id === paymentInvoice.id ? { ...inv, status: "Paid" } : inv
        );
        setInvoices(updatedInvoices);
        setFilteredInvoices((prev) =>
          prev.map((inv) =>
            inv.id === paymentInvoice.id ? { ...inv, status: "Paid" } : inv
          )
        );

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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          Billing & Invoices
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
              Request Invoice
            </h3>
            <form onSubmit={handleRequestInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={requestData.subject}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white cursor-not-allowed"
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
                  {projects.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="text-gray-900 bg-white dark:bg-akatech-card"
                    >
                      {p.title || p.name}
                    </option>
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
                      054 123 4567
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Name: AkaTech Solutions Ltd.
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
                        Bank: <strong>Standard Chartered</strong>
                      </p>
                      <p>
                        Account Name: <strong>AkaTech Solutions</strong>
                      </p>
                      <p>
                        Account Number: <strong>1234567890</strong>
                      </p>
                      <p>
                        Branch: <strong>Osu</strong>
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
                      Pay GH₵ {paymentInvoice.amount.toFixed(2)}
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
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {projects.find((p) => p.id === invoice.projectId)
                        ?.title || "Unknown Project"}
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
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                      {(invoice.status === "Unpaid" ||
                        invoice.status === "Overdue") && (
                        <button
                          onClick={() => handlePayNow(invoice)}
                          className="px-3 py-1 bg-akatech-gold text-white text-xs font-bold uppercase rounded hover:bg-akatech-goldDark transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        disabled={isDownloading}
                        className="text-gray-400 hover:text-akatech-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
                        title="Download PDF"
                        aria-label="Download invoice"
                      >
                        {isDownloading ? (
                          <span className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-akatech-gold block" />
                        ) : (
                          <Icons.Download className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
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
    </div>
  );
};
