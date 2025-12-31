import React, { useState, useEffect, useMemo } from "react";
import { Icons } from "@components/ui/Icons";
// import { localDataService } from "@lib/localData"; // Removed mock service
import { ClientSelectionModal } from "./ClientSelectionModal";

/**
 * AdminProjects Component
 *
 * Manages the full lifecycle of client projects.
 * Features:
 * - List view of all projects with status and phase indicators
 * - Create/Edit functionality via modal
 * - Delete capability
 * - Integration with secure API for data persistence
 */
export const AdminProjects = () => {
  // State for project list and UI controls
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  // Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state for creating/editing projects
  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    description: "",
    status: "Pending",
  });

  // Available clients for assignment
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Loads projects and clients from the API
   */
  const loadData = async () => {
    setIsLoadingClients(true);
    setIsLoadingProjects(true);
    try {
      // Fetch Clients
      const clientsRes = await fetch("/api/admin/clients");
      if (!clientsRes.ok) throw new Error("Failed to fetch clients");
      const clientsData = await clientsRes.json();

      // Map clients data to include status based on verification
      const mappedClients = clientsData.map((c) => ({
        ...c,
        status: c.googleId ? "Verified" : "Active",
      }));
      setClients(mappedClients);

      // Fetch Projects
      const projectsRes = await fetch("/api/admin/projects");
      if (!projectsRes.ok) throw new Error("Failed to fetch projects");
      const projectsData = await projectsRes.json();

      // Map projects data to frontend model
      const mappedProjects = projectsData.map((p) => ({
        id: p.id,
        clientId: p.userId,
        title: p.name,
        description: p.notes,
        status: p.status,
        currentPhase: p.plan, // Using plan as phase proxy
      }));
      setProjects(mappedProjects);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoadingClients(false);
      setIsLoadingProjects(false);
    }
  };

  /**
   * Opens the modal for creating or editing a project
   * @param {Object} project - The project to edit (null for new project)
   */
  const handleOpenModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
      setFormData({
        title: project.title,
        clientId: project.clientId,
        description: project.description || "",
        status: project.status || "Pending",
      });
    } else {
      setCurrentProject(null);
      setFormData({
        title: "",
        clientId: "",
        description: "",
        status: "Pending",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = currentProject ? "PUT" : "POST";
      const url = currentProject
        ? `/api/admin/projects/${currentProject.id}`
        : "/api/admin/projects";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save project");

      loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save project");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const res = await fetch(`/api/admin/projects/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete project");
        loadData();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete project");
      }
    }
  };

  const handleStatusChange = async (project, newStatus) => {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          clientId: project.clientId,
          description: project.description,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      loadData();
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const handleClientSelect = (client) => {
    setFormData({ ...formData, clientId: client.id });
    setIsClientModalOpen(false);
  };

  // --- Pagination & Filtering Logic ---
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const clientName = getClientName(project.clientId).toLowerCase();
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.includes(searchQuery.toLowerCase()) ||
        (project.description &&
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter, clients]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
          Project Management
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-akatech-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" /> Create Project
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-akatech-card p-4 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          data-testid="status-filter"
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Project
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">
                  Phase
                </th>
                <th className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {isLoadingProjects ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading projects...
                  </td>
                </tr>
              ) : (
                currentProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {project.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {getClientName(project.clientId)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={project.status}
                        onChange={(e) =>
                          handleStatusChange(project, e.target.value)
                        }
                        className={`cursor-pointer inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border outline-none focus:ring-2 focus:ring-offset-1 focus:ring-akatech-gold ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : project.status === "In Progress"
                            ? "bg-akatech-gold/10 text-akatech-gold border-akatech-gold/20"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {project.currentPhase || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(project)}
                        className="text-gray-400 hover:text-akatech-gold transition-colors"
                        title="Edit"
                      >
                        <Icons.PenTool className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!isLoadingProjects && projects.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No projects found. Create one to get started.
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-akatech-card w-full max-w-md rounded-lg shadow-xl border border-gray-200 dark:border-white/10">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentProject ? "Edit Project" : "New Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="project-title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Project Title
                </label>
                <input
                  id="project-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-akatech-gold focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client
                </label>
                <div
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setIsClientModalOpen(true)}
                >
                  <span
                    className={
                      formData.clientId
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400"
                    }
                  >
                    {formData.clientId
                      ? getClientName(formData.clientId)
                      : "Select Client"}
                  </span>
                  <Icons.ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                {/* Hidden input for validation if needed, or handle validation manually */}
                <input type="hidden" required value={formData.clientId} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-akatech-gold focus:border-transparent outline-none transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-akatech-gold focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-akatech-gold text-white font-bold uppercase tracking-widest rounded-lg hover:bg-akatech-goldDark transition-colors"
                >
                  {currentProject ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Selection Modal */}
      <ClientSelectionModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSelect={handleClientSelect}
        // onDelete={handleClientDelete} // Removed mock deletion
        clients={clients}
        isLoading={isLoadingClients}
      />
    </div>
  );
};
