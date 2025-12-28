import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { useToast } from "@components/ui/ToastProvider";

export const ClientSupport = ({ user }) => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "Normal",
    message: "",
  });

  const fetchTickets = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `/api/client/tickets?email=${encodeURIComponent(user.email)}`
      );
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Poll for updates (simple real-time simulation)
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [user.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTicket,
          userEmail: user.email,
          userName: user.name,
        }),
      });

      if (res.ok) {
        await fetchTickets();
        setIsModalOpen(false);
        setNewTicket({ subject: "", priority: "Normal", message: "" });
      }
    } catch (error) {
      console.error("Failed to create ticket", error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const res = await fetch(`/api/client/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          response: replyMessage,
        }),
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        // Update local state
        const updatedTickets = tickets.map((t) =>
          t.id === updatedTicket.id ? updatedTicket : t
        );
        setTickets(updatedTickets);
        setSelectedTicket(updatedTicket);
        setReplyMessage("");
      }
    } catch (error) {
      console.error("Failed to reply", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Urgent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          Support Tickets
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                layoutId={`ticket-${ticket.id}`}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-6 rounded-lg border cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id
                    ? "bg-white dark:bg-akatech-card border-akatech-gold shadow-md"
                    : "bg-white dark:bg-akatech-card border-gray-200 dark:border-white/10 hover:border-akatech-gold/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                      {ticket.subject}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">
                      #{ticket.id} • {ticket.createdAt}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-col items-end">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mt-2">
                  {ticket.message}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-akatech-card rounded-lg border border-dashed border-gray-200 dark:border-white/10">
              <Icons.LifeBuoy className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-500" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No tickets found.
              </p>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 p-6 flex flex-col h-full max-h-[600px]"
              >
                <div className="border-b border-gray-200 dark:border-white/10 pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span className="font-mono">#{selectedTicket.id}</span>
                      <span>•</span>
                      <span>{selectedTicket.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold uppercase ${getPriorityColor(
                        selectedTicket.priority
                      )}`}
                    >
                      {selectedTicket.priority}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
                  {/* Original Message */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs shrink-0">
                      YOU
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg rounded-tl-none border border-gray-100 dark:border-white/5">
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {selectedTicket.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedTicket.responses &&
                    selectedTicket.responses.map((reply, index) => (
                      <div
                        key={index}
                        className={`flex gap-4 ${
                          reply.sender === "client" ? "" : "flex-row-reverse"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                            reply.sender === "client"
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              : "bg-akatech-gold"
                          }`}
                        >
                          {reply.sender === "client" ? "YOU" : "S"}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`p-4 rounded-lg border ${
                              reply.sender === "client"
                                ? "bg-gray-50 dark:bg-white/5 rounded-tl-none border-gray-100 dark:border-white/5"
                                : "bg-akatech-gold/10 rounded-tr-none border-akatech-gold/20"
                            }`}
                          >
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                              {reply.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2 text-right">
                              {new Date(reply.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Reply Box */}
                <form
                  onSubmit={handleReply}
                  className="pt-4 border-t border-gray-200 dark:border-white/10"
                >
                  <div className="relative">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none resize-none text-sm"
                      rows="2"
                    />
                    <button
                      type="submit"
                      disabled={!replyMessage.trim()}
                      className="absolute right-2 bottom-2 p-2 bg-akatech-gold text-white rounded-md hover:bg-akatech-goldDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icons.Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg min-h-[400px]">
                <Icons.MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a ticket to view conversation</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-akatech-card w-full max-w-lg rounded-lg shadow-xl p-6 border border-gray-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Ticket
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="ticket-subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Subject
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                  placeholder="Brief summary of the issue"
                />
              </div>

              <div>
                <label
                  htmlFor="ticket-priority"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Priority
                </label>
                <select
                  id="ticket-priority"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, priority: e.target.value })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="ticket-message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="ticket-message"
                  required
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none resize-none"
                  value={newTicket.message}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, message: e.target.value })
                  }
                  placeholder="Describe your issue in detail..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Icons.Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
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
