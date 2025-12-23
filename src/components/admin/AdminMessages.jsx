import React, { useState, useEffect } from "react";
import { Icons } from "../../components/ui/Icons";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { io } from "socket.io-client";

// --- API Helper ---
const API_URL = "http://localhost:3001/api";

/**
 * AdminMessages Component
 *
 * Enhanced with Real-time Sync, Outlook Integration, and Client Selection.
 */
export const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // --- Bulk Actions ---
  const toggleSelection = (e, id) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.size} messages?`
      )
    )
      return;

    try {
      // In a real app, use a bulk delete endpoint
      // For now, delete one by one or send array
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`${API_URL}/messages/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(promises);
      setSelectedIds(new Set());
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  // --- Auth & Initial Load ---
  const performLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        setToken(data.token);
        return data.token;
      }
    } catch (err) {
      console.error("Auth failed", err);
    }
    return null;
  };

  useEffect(() => {
    const init = async () => {
      let currentToken = localStorage.getItem("adminToken");
      if (!currentToken) {
        currentToken = await performLogin();
      }
      if (currentToken) {
        fetchMessages(currentToken);
        fetchClients(currentToken);
      }
    };
    init();
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input/textarea
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "c":
        case "C":
          e.preventDefault();
          setIsComposeOpen(true);
          break;
        case "Escape":
          if (isComposeOpen) setIsComposeOpen(false);
          else if (selectedMessage) setSelectedMessage(null);
          break;
        case "Delete":
        case "Backspace":
          if (selectedIds.size > 0) {
            handleBulkDelete();
          } else if (selectedMessage) {
            handleDelete(e, selectedMessage.id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isComposeOpen, selectedMessage, selectedIds]);

  // --- Real-time Sync ---
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => console.log("Socket connected"));

    socket.on("new_message", (msg) => {
      setMessages((prev) => [msg, ...prev]);
    });

    socket.on("update_messages", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
      );
      if (selectedMessage?.id === updatedMsg.id) {
        setSelectedMessage(updatedMsg);
      }
    });

    socket.on("delete_messages", (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    });

    socket.on("update_subscriptions", () => {
      const token = localStorage.getItem("adminToken");
      if (token) fetchClients(token, false);
    });

    return () => socket.disconnect();
  }, [selectedMessage]);

  // --- API Calls ---
  const fetchMessages = async (authToken, retry = true) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        if ((res.status === 401 || res.status === 403) && retry) {
          console.log("Token expired/invalid, re-authenticating...");
          const newToken = await performLogin();
          if (newToken) {
            return fetchMessages(newToken, false);
          }
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      // Sort by date desc
      setMessages(
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    } catch (err) {
      console.error("Fetch messages failed", err);
      setError("Failed to load messages. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async (authToken, retry = true) => {
    try {
      const res = await fetch(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) {
        if ((res.status === 401 || res.status === 403) && retry) {
          const newToken = await performLogin(); // Reuse login
          if (newToken) {
            return fetchClients(newToken, false);
          }
        }
        if (res.status === 404) {
          console.warn(
            "API /clients endpoint not found. The server might need a restart."
          );
          setClients([]);
          return;
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Received non-JSON response:", text.substring(0, 100));
        throw new Error("Received non-JSON response from server");
      }

      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Fetch clients failed", err);
      // Don't block the whole UI for clients failure
      // setError("Failed to load clients.");
    }
  };

  const handleOutlookReply = () => {
    if (!selectedMessage) return;

    const subject = `Re: ${selectedMessage.subject}`;
    const body = `\n\n--- Original Message ---\nFrom: ${
      selectedMessage.name
    }\nDate: ${selectedMessage.timestamp}\n\n${
      selectedMessage.content || selectedMessage.message
    }`;

    const mailtoLink = `mailto:${
      selectedMessage.email
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Create a temporary link and click it to avoid ERR_ABORTED in some browsers
    const link = document.createElement("a");
    link.href = mailtoLink;
    // target="_blank" is safer for mailto links as it prevents the browser from
    // attempting to navigate the current page to the mailto: URL.
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this message?")) {
      try {
        await fetch(`${API_URL}/messages/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        // UI updates via socket
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    if (message.status !== "read" && message.direction !== "outbound") {
      try {
        await fetch(`${API_URL}/messages/${message.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "read" }),
        });
      } catch (err) {
        console.error("Mark read failed", err);
      }
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(composeData),
      });
      if (!res.ok) throw new Error("Failed to send");

      setIsComposeOpen(false);
      setComposeData({ to: "", subject: "", message: "" });
      alert("Message sent successfully!");
    } catch (err) {
      alert("Failed to send message. Please try again.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    // 1. Filter by Status/Type
    if (filter === "unread" && msg.status !== "unread") return false;
    if (filter === "sent" && msg.direction !== "outbound") return false;

    // 2. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        msg.subject?.toLowerCase().includes(q) ||
        msg.name?.toLowerCase().includes(q) ||
        msg.email?.toLowerCase().includes(q) ||
        (msg.content || msg.message)?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 p-6 relative">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3 backdrop-blur-md shadow-lg">
          <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Floating Action Button for Compose */}
      <button
        onClick={() => setIsComposeOpen(true)}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-akatech-gold text-white p-4 rounded-full shadow-lg hover:bg-akatech-goldDark transition-transform hover:scale-110"
        title="Compose Message (C)"
      >
        <Icons.Edit className="w-6 h-6" />
      </button>

      {/* Message List */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm ${
          selectedMessage ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex flex-col gap-4 bg-gray-50 dark:bg-white/5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.MessageSquare className="w-5 h-5 text-akatech-gold" />
              Inbox
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="ml-4 text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  Delete ({selectedIds.size})
                </button>
              )}
            </h2>
            <div className="flex gap-2">
              {["all", "unread", "sent"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize ${
                    filter === f
                      ? "bg-akatech-gold text-white"
                      : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {/* Search Bar */}
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:border-akatech-gold outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No messages found.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-white/5">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative group flex gap-3 ${
                    selectedMessage?.id === msg.id
                      ? "bg-akatech-gold/10 dark:bg-akatech-gold/5"
                      : ""
                  } ${
                    msg.status === "unread"
                      ? "border-l-4 border-akatech-gold pl-3"
                      : "pl-4"
                  }`}
                >
                  {/* Checkbox for Bulk Selection */}
                  <div
                    onClick={(e) => toggleSelection(e, msg.id)}
                    className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      selectedIds.has(msg.id)
                        ? "bg-akatech-gold border-akatech-gold"
                        : "border-gray-300 dark:border-white/30 hover:border-akatech-gold"
                    }`}
                  >
                    {selectedIds.has(msg.id) && (
                      <Icons.Check className="w-3 h-3 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3
                        className={`text-sm font-medium truncate ${
                          msg.status === "unread"
                            ? "text-gray-900 dark:text-white font-bold"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {msg.name || "Admin"}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {format(new Date(msg.timestamp), "MMM d")}
                      </span>
                    </div>
                    <div
                      className={`text-sm mb-1 truncate ${
                        msg.status === "unread"
                          ? "text-gray-900 dark:text-white font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {msg.subject}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {msg.content || msg.message}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, msg.id)}
                    className="self-center p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Detail View */}
      <AnimatePresence mode="wait">
        {selectedMessage ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-[2] bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">
                  {selectedMessage.subject}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                    {selectedMessage.name}
                  </span>
                  <span>&lt;{selectedMessage.email}&gt;</span>
                  {clients.find((c) => c.email === selectedMessage.email)
                    ?.status === "active" && (
                    <p className="text-green-600 dark:text-green-400 font-bold text-xs ml-2 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20">
                      Present
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 text-right">
                  {format(new Date(selectedMessage.timestamp), "MMM d, yyyy")}
                  <br />
                  {format(new Date(selectedMessage.timestamp), "h:mm a")}
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedMessage.content || selectedMessage.message}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  setComposeData({
                    to: selectedMessage.email,
                    subject: `Re: ${selectedMessage.subject}`,
                    message: `\n\n--- Original Message ---\nFrom: ${
                      selectedMessage.name
                    }\nDate: ${selectedMessage.timestamp}\n\n${
                      selectedMessage.content || selectedMessage.message
                    }`,
                  });
                  setIsComposeOpen(true);
                }}
                className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark rounded-lg transition-colors flex items-center gap-2"
                title="Reply internally via Webmail"
              >
                <Icons.MessageSquare className="w-4 h-4" /> Reply
              </button>
              <button
                onClick={handleOutlookReply}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold uppercase tracking-widest hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                title="Open Outlook Desktop App"
              >
                <Icons.Edit className="w-4 h-4" /> Reply via Outlook
              </button>
              <button
                onClick={(e) => handleDelete(e, selectedMessage.id)}
                className="px-4 py-2 bg-white dark:bg-transparent border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 rounded-lg transition-all flex items-center gap-2"
              >
                <Icons.Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="hidden md:flex flex-[2] bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 items-center justify-center text-gray-400 flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              <Icons.MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p>Select a message to view details</p>
          </div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-akatech-card w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  New Message
                </h3>
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    To
                  </label>
                  <div className="relative">
                    <input
                      list="clients-list"
                      type="email"
                      required
                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:border-akatech-gold outline-none"
                      value={composeData.to}
                      onChange={(e) =>
                        setComposeData({ ...composeData, to: e.target.value })
                      }
                      placeholder="Select or type email..."
                    />
                    <datalist id="clients-list">
                      {clients.map((c) => (
                        <option key={c.email} value={c.email}>
                          {c.name} ({c.source})
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:border-akatech-gold outline-none"
                    value={composeData.subject}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows="6"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm focus:border-akatech-gold outline-none resize-none"
                    value={composeData.message}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
