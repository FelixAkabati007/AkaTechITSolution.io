import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { AnimatePresence, motion } from "framer-motion";
import { getApiUrl } from "@lib/config";

export const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    try {
      const res = await fetch(`${getApiUrl()}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTickets(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem("adminToken");
    try {
      await fetch(`${getApiUrl()}/tickets/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${getApiUrl()}/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          Support Tickets
        </h2>
      </div>

      <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Priority
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
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                    #{ticket.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {ticket.subject}
                    <div className="text-xs text-gray-500 font-normal mt-1 line-clamp-1">
                      {ticket.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {ticket.userName || "Unknown"}
                    </div>
                    <div className="text-xs">{ticket.userEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.priority === "High"
                          ? "bg-red-100 text-red-800"
                          : ticket.priority === "Urgent"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleUpdateStatus(ticket.id, e.target.value)
                      }
                      className="text-xs bg-transparent border-none font-medium focus:ring-0 cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-gray-400 hover:text-akatech-gold transition-colors"
                      title="View & Reply"
                    >
                      <Icons.MessageSquare className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-akatech-card w-full max-w-2xl rounded-lg shadow-2xl border border-akatech-gold flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedTicket.subject}
                  </h3>
                  <div className="text-sm text-gray-500">
                    From:{" "}
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selectedTicket.userName}
                    </span>{" "}
                    ({selectedTicket.userEmail})
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)}>
                  <Icons.X className="w-6 h-6 text-gray-500 hover:text-red-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Original Message */}
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Original Message
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Responses */}
                {selectedTicket.responses &&
                  selectedTicket.responses.map((resp, i) => (
                    <div
                      key={i}
                      className={`flex gap-4 ${
                        resp.sender === "admin" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          resp.sender === "admin"
                            ? "bg-akatech-gold text-black"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {resp.sender === "admin" ? "A" : "U"}
                      </div>
                      <div
                        className={`p-4 rounded-lg max-w-[80%] ${
                          resp.sender === "admin"
                            ? "bg-akatech-gold/10 border border-akatech-gold/20"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{resp.message}</p>
                        <div className="text-[10px] text-gray-400 mt-1 text-right">
                          {new Date(resp.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20">
                <form onSubmit={handleReply}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-akatech-card focus:border-akatech-gold outline-none h-24 mb-3 resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-6 py-2 bg-akatech-gold text-black font-bold rounded hover:bg-white hover:text-akatech-gold border border-akatech-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Response
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
