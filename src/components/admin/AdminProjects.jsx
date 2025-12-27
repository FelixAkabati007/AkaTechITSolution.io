import React, { useState, useEffect } from "react";
import { Icons } from "../../../AkaTech_Components/ui/Icons";
import { localDataService } from "@lib/localData";
import { ClientSelectionModal } from "./ClientSelectionModal";

/**
 * AdminProjects Component
 *
 * Manages the full lifecycle of client projects.
 * Features:
 * - List view of all projects with status and phase indicators
 * - Create/Edit functionality via modal
 * - Delete capability
 * - Integration with localDataService for data persistence
 */
export const AdminProjects = () => {
  // State for project list and UI controls
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

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

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Loads projects and clients from the service
   */
  const loadData = () => {
    setIsLoadingClients(true);
    // Simulate network delay for realistic loading state
    setTimeout(() => {
      setProjects(localDataService.getProjects());
      setClients(
        localDataService
          .getUsers()
          .filter((u) => u.role === "Client" && u.status === "Verified")
      );
      setIsLoadingClients(false);
    }, 500);
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
        description: project.description,
        status: project.status,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      clientId: parseInt(formData.clientId),
      id: currentProject ? currentProject.id : undefined,
    };

    localDataService.saveProject(projectData);
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      localDataService.deleteProject(id);
      loadData();
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
              {projects.map((project) => (
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
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        project.status === "Completed"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : project.status === "In Progress"
                          ? "bg-akatech-gold/10 text-akatech-gold border-akatech-gold/20"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {project.status}
                    </span>
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
              ))}
              {projects.length === 0 && (
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title
                </label>
                <input
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
                      ? getClientName(parseInt(formData.clientId))
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-akatech-gold focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-akatech-gold text-white font-bold rounded-lg hover:bg-akatech-goldDark transition-colors"
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
        onDelete={handleClientDelete}
        clients={clients}
        isLoading={isLoadingClients}
      />
    </div>
  );
};
