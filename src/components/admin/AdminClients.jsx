import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Icons } from "@components/ui/Icons";
import { localDataService } from "@lib/localData";
import { useToast } from "@components/ui/ToastProvider";
import { io } from "socket.io-client";
import { jsPDF } from "jspdf";

export const AdminClients = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const { addToast } = useToast();

  // Search, Filter, Pagination, Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false);

  // Invoice Generation
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    amount: "",
    description: "",
    dueDate: "",
    items: [{ description: "", quantity: 1, price: 0 }],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Verification state

  const [invoices, setInvoices] = useState([]); // To track financial metrics properly
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  const fetchInvoices = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/admin/invoices", {
        // Assuming this endpoint exists or I should add it to get all invoices for metrics
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      // console.error("Error fetching invoices:", error);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getClientMetrics = (userId) => {
    const clientInvoices = invoices.filter((inv) => inv.userId === userId);
    const totalSpent = clientInvoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const outstanding = clientInvoices
      .filter((inv) => inv.status !== "Paid" && inv.status !== "Cancelled")
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    return { totalSpent, outstanding };
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        // Fallback to mock if API fails or not admin
        console.warn("Failed to fetch users, falling back to mock data");
        addToast(
          "Failed to fetch users from server. Showing local data.",
          "warning"
        );
        setUsers(localDataService.getUsers());
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      addToast("Network error. Showing local data.", "error");
      setUsers(localDataService.getUsers());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    socket.on("user_registered", (registeredUser) => {
      setUsers((prevUsers) => {
        // Prevent duplicates
        if (
          prevUsers.some(
            (u) =>
              u.id === registeredUser.id || u.email === registeredUser.email
          )
        ) {
          return prevUsers;
        }
        addToast(`New client registered: ${registeredUser.name}`, "info");
        return [...prevUsers, registeredUser];
      });
    });

    // Listen for invoice updates to keep metrics in sync
    socket.on("invoice_generated", () => fetchInvoices());
    socket.on("invoice_paid", () => fetchInvoices());
    socket.on("new_invoice_request", () => fetchInvoices());

    return () => {
      socket.disconnect();
    };
  }, [addToast, fetchInvoices]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!newUser.name || !newUser.email || (!newUser.id && !newUser.password)) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUser, accountType: "manual" }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("User registered successfully!", "success");
        fetchUsers();
        setIsModalOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "client" });
      } else {
        addToast(data.error || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      addToast("An error occurred during registration", "error");
    }
  };

  const handleEditUser = (user) => {
    setNewUser({ ...user, password: "" }); // Don't show password
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // API call to delete user would go here
      localDataService.deleteUser(id);
      setUsers(localDataService.getUsers());
      addToast("User deleted (mock)", "info");
    }
  };

  // --- Invoice Logic ---
  const handleAddItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: "", quantity: 1, price: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((sum, item) => {
      return (
        sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)
      );
    }, 0);
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    // Validation
    if (!invoiceData.dueDate) {
      addToast("Please select a due date", "error");
      return;
    }
    if (invoiceData.items.length === 0) {
      addToast("Please add at least one item", "error");
      return;
    }
    // Check verification
    if (!isVerified) {
      addToast("Please verify the invoice details before generating.", "error");
      return;
    }

    for (const item of invoiceData.items) {
      if (!item.description.trim()) {
        addToast("All items must have a description", "error");
        return;
      }
      if (item.quantity <= 0) {
        addToast("Item quantity must be greater than 0", "error");
        return;
      }
      if (item.price < 0) {
        addToast("Item price cannot be negative", "error");
        return;
      }
    }

    setIsGenerating(true);

    try {
      const totalAmount = calculateTotal();

      // 1. Generate PDF
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("INVOICE", 105, 20, null, null, "center");

      doc.setFontSize(12);
      doc.text(`Bill To: ${selectedClient.name}`, 20, 40);
      doc.text(`Email: ${selectedClient.email}`, 20, 50);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 40);
      doc.text(
        `Due Date: ${
          invoiceData.dueDate
            ? new Date(invoiceData.dueDate).toLocaleDateString()
            : "N/A"
        }`,
        150,
        50
      );

      let yPos = 70;
      doc.setFont(undefined, "bold");
      doc.text("Description", 20, yPos);
      doc.text("Qty", 130, yPos);
      doc.text("Price", 150, yPos);
      doc.text("Total", 170, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);

      doc.setFont(undefined, "normal");
      yPos += 10;

      invoiceData.items.forEach((item) => {
        const lineTotal = (item.quantity * item.price).toFixed(2);
        doc.text(item.description, 20, yPos);
        doc.text(item.quantity.toString(), 130, yPos);
        doc.text(item.price.toFixed(2), 150, yPos);
        doc.text(lineTotal, 170, yPos);
        yPos += 10;
      });

      doc.line(20, yPos, 190, yPos);
      yPos += 10;
      doc.setFont(undefined, "bold");
      doc.text(`Total: GHc ${totalAmount.toFixed(2)}`, 150, yPos);

      const pdfBase64 = doc.output("datauristring").split(",")[1];

      // 2. Send to Backend
      const token = localStorage.getItem("token");
      const res = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedClient.id,
          items: invoiceData.items,
          amount: totalAmount,
          dueDate: invoiceData.dueDate,
          description: invoiceData.description || "Services Rendered",
          pdfBase64,
        }),
      });

      if (res.ok) {
        addToast("Invoice generated and sent successfully!", "success");
        setIsInvoiceModalOpen(false);
        fetchInvoices(); // Refresh metrics
        setInvoiceData({
          amount: "",
          description: "",
          dueDate: "",
          items: [{ description: "", quantity: 1, price: 0 }],
        });
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to generate invoice", "error");
      }
    } catch (error) {
      console.error("Invoice Error:", error);
      addToast("An error occurred while generating invoice", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Pagination & Filtering Logic ---
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    if (!users || users.length === 0) {
      addToast("No data to export", "warning");
      return;
    }

    // Define CSV headers and map data
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Joined Date",
      "Status",
      "Account Type",
    ];
    const csvContent = [
      headers.join(","),
      ...users.map((user) => {
        const joinedDate =
          user.joinedAt || user.createdAt
            ? new Date(user.joinedAt || user.createdAt).toLocaleDateString()
            : "N/A";
        const status = user.googleId ? "Verified (Google)" : "Active (Email)";
        const accountType = user.googleId ? "Google Auth" : "Standard";

        return [
          user.id,
          `"${user.name || ""}"`, // Quote name to handle commas
          user.email,
          user.role,
          joinedDate,
          status,
          accountType,
        ].join(",");
      }),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `clients_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle specific sorting cases
        if (sortConfig.key === "spent") {
          aValue = getClientMetrics(a.id).totalSpent;
          bValue = getClientMetrics(b.id).totalSpent;
        } else if (sortConfig.key === "joinedAt") {
          aValue = new Date(a.joinedAt || a.createdAt || 0);
          bValue = new Date(b.joinedAt || b.createdAt || 0);
        } else if (sortConfig.key === "status") {
          aValue = a.googleId ? "Verified (Google)" : "Active";
          bValue = b.googleId ? "Verified (Google)" : "Active";
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [users, searchQuery, roleFilter, sortConfig, invoices]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
          User Management
        </h2>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none w-full md:w-64"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>

          {/* Filter */}
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter
            }}
          >
            <option value="all">All Roles</option>
            <option value="client">Client</option>
            <option value="project_manager">Project Manager</option>
            <option value="finance">Finance</option>
          </select>

          <button
            onClick={() => {
              setNewUser({ name: "", email: "", password: "", role: "client" });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Icons.Plus className="w-4 h-4" /> Add User
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white text-sm font-bold uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap rounded"
            title="Export to CSV"
          >
            <Icons.Download className="w-4 h-4" /> Export
          </button>

          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors rounded-lg"
            title="Refresh List"
          >
            <Icons.RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Financial Metrics Display - Moved to Dashboard */}

      <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th
                  className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors select-none"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "asc" ? (
                        <Icons.ArrowUp className="w-3 h-3" />
                      ) : (
                        <Icons.ArrowDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors select-none"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortConfig.key === "email" &&
                      (sortConfig.direction === "asc" ? (
                        <Icons.ArrowUp className="w-3 h-3" />
                      ) : (
                        <Icons.ArrowDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors select-none"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center gap-2">
                    Role
                    {sortConfig.key === "role" &&
                      (sortConfig.direction === "asc" ? (
                        <Icons.ArrowUp className="w-3 h-3" />
                      ) : (
                        <Icons.ArrowDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors select-none"
                  onClick={() => handleSort("spent")}
                >
                  <div className="flex items-center gap-2">
                    Spent / Due
                    {sortConfig.key === "spent" &&
                      (sortConfig.direction === "asc" ? (
                        <Icons.ArrowUp className="w-3 h-3" />
                      ) : (
                        <Icons.ArrowDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors select-none"
                  onClick={() => handleSort("joinedAt")}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    {sortConfig.key === "joinedAt" &&
                      (sortConfig.direction === "asc" ? (
                        <Icons.ArrowUp className="w-3 h-3" />
                      ) : (
                        <Icons.ArrowDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors select-none"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortConfig.key === "status" &&
                      (sortConfig.direction === "asc" ? (
                        <Icons.ArrowUp className="w-3 h-3" />
                      ) : (
                        <Icons.ArrowDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Icons.Loader className="w-5 h-5 animate-spin" />
                      Loading clients...
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No clients found matching your criteria.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const { totalSpent, outstanding } = getClientMetrics(user.id);
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-akatech-gold flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-mono text-gray-600 dark:text-gray-400">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          GH₵ {totalSpent.toFixed(2)}
                        </div>
                        {outstanding > 0 && (
                          <div className="text-red-500 dark:text-red-400 mt-1">
                            Due: GH₵ {outstanding.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {user.joinedAt || user.createdAt
                          ? new Date(
                              user.joinedAt || user.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.googleId
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {user.googleId ? "Verified (Google)" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {user.role === "client" && (
                          <button
                            onClick={() => {
                              setSelectedClient(user);
                              setInvoiceData({
                                amount: "",
                                description: "",
                                dueDate: "",
                                items: [
                                  { description: "", quantity: 1, price: 0 },
                                ],
                              });
                              setIsVerified(false); // Reset verification
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                            aria-label="Generate Invoice"
                            title="Generate Invoice"
                          >
                            <Icons.FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-400 hover:text-akatech-gold transition-colors"
                          aria-label="Edit user"
                          title="Edit User"
                        >
                          <Icons.PenTool className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete user"
                          title="Delete User"
                        >
                          <Icons.Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-white/10 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-white/10 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Invoice Generation Modal */}
      {isInvoiceModalOpen && selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsInvoiceModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-akatech-card w-full max-w-2xl rounded-lg shadow-xl p-6 border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar scroll-hint"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Generate Invoice for {selectedClient.name}
            </h3>
            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Web Development Services"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={invoiceData.description}
                  onChange={(e) =>
                    setInvoiceData({
                      ...invoiceData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  data-testid="invoice-due-date"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={invoiceData.dueDate}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items
                </label>
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input
                      type="text"
                      placeholder="Item Description"
                      required
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      required
                      min="1"
                      className="w-20 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      required
                      min="0"
                      step="0.01"
                      className="w-24 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      disabled={invoiceData.items.length === 1}
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm text-akatech-gold hover:underline flex items-center gap-1"
                >
                  <Icons.Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              {/* Verification Checkbox */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <input
                  type="checkbox"
                  id="verifyInvoice"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 text-akatech-gold border-gray-300 rounded focus:ring-akatech-gold"
                />
                <label
                  htmlFor="verifyInvoice"
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  I have verified the invoice details and items.
                </label>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Total: GH₵ {calculateTotal().toFixed(2)}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Icons.Loader className="w-4 h-4 animate-spin" />{" "}
                        Generating...
                      </>
                    ) : (
                      "Generate & Send"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-akatech-card w-full max-w-md rounded-lg shadow-xl p-6 border border-gray-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {newUser.id ? "Edit User" : "Add New User"}
            </h3>
            <form
              onSubmit={handleRegister}
              className="space-y-4"
              aria-label={newUser.id ? "edit-user-form" : "add-user-form"}
            >
              <div>
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="userName"
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="userEmail"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="userEmail"
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>

              {!newUser.id && (
                <div>
                  <label
                    htmlFor="userPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="userPassword"
                    type="password"
                    required={!newUser.id}
                    placeholder={
                      newUser.id ? "Leave blank to keep current" : ""
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                    value={newUser.password || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="userRole"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Role
                </label>
                <select
                  id="userRole"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="client">Client</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="finance">Finance</option>
                  <option value="super_admin">Super Admin</option>
                </select>
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
                  className="px-6 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors"
                >
                  {newUser.id ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
