import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";
import { jsPDF } from "jspdf";

export const ClientBilling = ({ user }) => {
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
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    const data = mockService.getInvoices(user.id);
    setInvoices(data);
    setFilteredInvoices(data);
  }, [user.id]);

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
          mockService.getProjects().find((p) => p.id === invoice.projectId)
            ?.title || "Unknown Project";
        doc.text(`Project: ${project}`, 10, 80);

        doc.text(`Amount: GH₵ ${invoice.amount.toFixed(2)}`, 10, 100);
        doc.text(`Status: ${invoice.status}`, 10, 110);

        // Save the PDF
        doc.save(`Invoice-${invoice.id}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate invoice PDF. Please try again.");
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  const handleRequestInvoice = (e) => {
    e.preventDefault();
    mockService.createTicket({
      clientId: user.id,
      subject: requestData.subject,
      priority: "Medium",
      message: requestData.message,
      sender: "Client",
    });
    setIsModalOpen(false);
    setRequestData({ subject: "Invoice Request", message: "" });
    // In a real app, show a toast notification here
  };

  const handlePayNow = (invoice) => {
    setPaymentInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const processPayment = (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      const updatedInvoice = { ...paymentInvoice, status: "Paid" };
      const updatedInvoices = invoices.map((inv) =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      );

      setInvoices(updatedInvoices);
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(false);
      setPaymentInvoice(null);
      setPaymentDetails({ cardNumber: "", expiry: "", cvv: "" });
      alert("Payment successful!");
    }, 2000);
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
            className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors"
          >
            Request Invoice
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-akatech-card p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white"
                />
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
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors"
                >
                  Submit Request
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

            <form onSubmit={processPayment} className="space-y-4">
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
                      {mockService
                        .getProjects()
                        .find((p) => p.id === invoice.projectId)?.title ||
                        "Unknown Project"}
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
