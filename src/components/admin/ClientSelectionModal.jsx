import React, { useState, useMemo } from "react";
import { Icons } from "../../../AkaTech_Components/ui/Icons";
import { motion, AnimatePresence } from "framer-motion";

export const ClientSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  clients,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "joinedAt",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sorting and Filtering
  const filteredClients = useMemo(() => {
    let sorted = [...clients];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return sorted.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, sortConfig, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column)
      return <Icons.ArrowUp className="w-3 h-3 opacity-0" />;
    return sortConfig.direction === "ascending" ? (
      <Icons.ArrowUp className="w-3 h-3" />
    ) : (
      <Icons.ArrowDown className="w-3 h-3" />
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-akatech-card w-full max-w-3xl rounded-lg shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Select Client
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Icons.X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-transparent focus:ring-2 focus:ring-akatech-gold outline-none"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                  <tr>
                    {[
                      { key: "id", label: "ID" },
                      { key: "name", label: "Name" },
                      { key: "email", label: "Email" },
                      { key: "joinedAt", label: "Joined" },
                      { key: "status", label: "Status" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => requestSort(col.key)}
                        className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors select-none"
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          <SortIcon column={col.key} />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {paginatedClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        #{client.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-akatech-gold flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                            {client.avatar ? (
                              <img
                                src={client.avatar}
                                alt={client.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              client.name.charAt(0)
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {client.email}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {client.joinedAt
                          ? new Date(client.joinedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            client.status === "Verified"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {client.status || "Unverified"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => onSelect(client)}
                          className="px-3 py-1 bg-akatech-gold text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-akatech-goldDark transition-colors"
                        >
                          Select
                        </button>
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(client.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete Client"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedClients.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No clients found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredClients.length)}{" "}
                  of {filteredClients.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded transition-colors ${
                          currentPage === page
                            ? "bg-akatech-gold text-white"
                            : "border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
