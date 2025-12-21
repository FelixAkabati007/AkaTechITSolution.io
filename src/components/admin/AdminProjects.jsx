import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { AnimatePresence, motion } from "framer-motion";

export const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    email: "",
    plan: "",
    notes: "",
    company: "",
  });

  const fetchProjects = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProject)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewProject({ name: "", email: "", plan: "", notes: "", company: "" });
        fetchProjects();
      }
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('adminToken');
    try {
        await fetch(`http://localhost:3001/api/projects/${id}`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        fetchProjects();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
          Project Management
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-akatech-gold text-black px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-akatech-gold border border-akatech-gold transition-colors"
        >
          New Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="py-4 font-medium">Project Plan</th>
              <th className="py-4 font-medium">Client</th>
              <th className="py-4 font-medium">Company</th>
              <th className="py-4 font-medium">Status</th>
              <th className="py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <td className="py-4 font-medium text-gray-900 dark:text-white">
                  <div>
                    {project.plan}
                    <div className="text-xs text-gray-500 font-normal mt-0.5 max-w-xs truncate">{project.notes}</div>
                  </div>
                </td>
                <td className="py-4 text-gray-500">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                    <div className="text-xs">{project.email}</div>
                </td>
                <td className="py-4 text-gray-500">{project.company || '-'}</td>
                <td className="py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {project.status !== 'completed' && (
                        <button 
                            onClick={() => updateStatus(project.id, 'completed')}
                            className="text-green-600 hover:text-green-800" title="Mark Complete">
                            <Icons.Check className="w-4 h-4" />
                        </button>
                    )}
                    <button className="text-gray-400 hover:text-akatech-gold transition-colors">
                        <Icons.MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-akatech-card w-full max-w-lg rounded-lg shadow-2xl border border-akatech-gold p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-gray-900 dark:text-white">
                  Create New Project
                </h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <Icons.X className="w-6 h-6 text-gray-500 hover:text-red-500" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Project Plan/Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newProject.plan}
                    onChange={(e) => setNewProject({ ...newProject, plan: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                        Client Name
                    </label>
                    <input
                        type="text"
                        required
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold"
                    />
                    </div>
                    <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                        Client Email
                    </label>
                    <input
                        type="email"
                        required
                        value={newProject.email}
                        onChange={(e) => setNewProject({ ...newProject, email: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold"
                    />
                    </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={newProject.company}
                    onChange={(e) => setNewProject({ ...newProject, company: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Notes/Description
                  </label>
                  <textarea
                    value={newProject.notes}
                    onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-2 focus:outline-none focus:border-akatech-gold h-24"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-akatech-gold text-black px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-akatech-gold border border-akatech-gold transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
