import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";

export const ClientProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const fileInputRef = useRef(null);

  const fetchProjects = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/client/projects?email=${encodeURIComponent(
          user.email
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        // Map API data to UI structure
        const mappedProjects = data.map((p) => ({
          id: p.id,
          title: `${p.plan} Project`, // Use plan as title for now
          description: p.notes || "No details provided.",
          status:
            p.status === "pending"
              ? "Initiation"
              : p.status === "in-progress"
              ? "In Progress"
              : p.status === "completed"
              ? "Completed"
              : p.status,
          currentPhase:
            p.status === "pending" ? "Request Review" : "Active Development",
          phases: [
            // Mock phases for now as backend doesn't support them yet
            {
              name: "Request Received",
              status: "Completed",
              date: new Date(p.timestamp).toLocaleDateString(),
            },
            {
              name: "Review",
              status: p.status === "pending" ? "In Progress" : "Completed",
              date: "-",
            },
            {
              name: "Development",
              status: p.status === "in-progress" ? "In Progress" : "Pending",
              date: "-",
            },
          ],
          files: [], // Backend doesn't support files yet
        }));
        setProjects(mappedProjects);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000);
    return () => clearInterval(interval);
  }, [user.email]);

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e) => {
    // File upload simulation (Backend implementation pending)
    const file = e.target.files[0];
    if (file && selectedProject) {
      alert("File upload backend integration coming soon!");
    }
  };

  const handleRequestUpdate = async (e) => {
    e.preventDefault();
    if (!requestMessage.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Update Request: ${selectedProject.title}`,
          message: requestMessage,
          priority: "medium",
          userEmail: user.email,
          userName: user.name,
        }),
      });

      if (res.ok) {
        setIsRequestModalOpen(false);
        setRequestMessage("");
        alert("Update request sent successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          My Projects
        </h2>
        <div className="relative w-full md:w-64">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:ring-2 focus:ring-akatech-gold outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layoutId={`project-${project.id}`}
                onClick={() => setSelectedProject(project)}
                className={`p-6 rounded-lg border cursor-pointer transition-all ${
                  selectedProject?.id === project.id
                    ? "bg-white dark:bg-akatech-card border-akatech-gold shadow-md"
                    : "bg-white dark:bg-akatech-card border-gray-200 dark:border-white/10 hover:border-akatech-gold/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                      project.status === "In Progress"
                        ? "bg-akatech-gold/20 text-akatech-gold"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Icons.Activity className="w-3 h-3" />
                  <span>Phase: {project.currentPhase}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No projects found matching your search.
            </div>
          )}
        </div>

        {/* Project Details */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-akatech-card rounded-lg border border-gray-200 dark:border-white/10 p-8"
              >
                <div className="border-b border-gray-200 dark:border-white/10 pb-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
                      {selectedProject.title}
                    </h2>
                    <button
                      onClick={() => setIsRequestModalOpen(true)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-akatech-gold hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Icons.MessageSquare className="w-3 h-3" />
                      Request Update
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Icons.Clock className="w-4 h-4 text-akatech-gold" />{" "}
                      Timeline
                    </h3>
                    <div className="space-y-6 pl-2 border-l border-gray-200 dark:border-gray-700 ml-2">
                      {selectedProject.phases.map((phase, i) => (
                        <div key={i} className="relative pl-6">
                          <div
                            className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                              phase.status === "Completed"
                                ? "bg-green-500"
                                : phase.status === "In Progress"
                                ? "bg-akatech-gold"
                                : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          ></div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {phase.name}
                          </h4>
                          <div className="flex justify-between items-center text-xs mt-1">
                            <span className="text-gray-500">
                              {phase.status}
                            </span>
                            <span className="text-gray-400 font-mono">
                              {phase.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icons.FileText className="w-4 h-4 text-akatech-gold" />{" "}
                        Deliverables
                      </h3>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-akatech-gold hover:underline font-bold flex items-center gap-1"
                      >
                        <Icons.Upload className="w-3 h-3" /> Upload
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {selectedProject.files &&
                    selectedProject.files.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedProject.files.map((file, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded border border-gray-200 dark:border-white/5 group"
                          >
                            <div className="flex items-center gap-3">
                              <Icons.FileText className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {file.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {file.date} • {file.size}
                                </p>
                              </div>
                            </div>
                            <button
                              className="text-gray-400 hover:text-akatech-gold transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10"
                              title="Download"
                            >
                              <Icons.Download className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-white/5 rounded border border-dashed border-gray-300 dark:border-gray-700">
                        <Icons.FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No deliverables uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg">
                <Icons.Code className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a project to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Request Update Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-akatech-card p-6 rounded-lg w-full max-w-md border border-gray-200 dark:border-white/10 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Request Project Update
              </h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  required
                  placeholder="What specific update would you like to request?"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-akatech-gold outline-none h-32 resize-none"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-akatech-gold text-white rounded-lg font-bold hover:bg-akatech-goldDark transition-colors text-sm"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
