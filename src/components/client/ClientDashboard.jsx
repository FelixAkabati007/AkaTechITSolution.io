import React, { useEffect, useState } from "react";
import { Icons } from "@components/ui/Icons";
import { getApiUrl } from "@lib/config";

export const ClientDashboard = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    invoicesDue: 0,
    tickets: 0,
    status: "Online",
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user?.email) return;

    const fetchData = async () => {
      try {
        const [projRes, tickRes] = await Promise.all([
          fetch(
            `${getApiUrl()}/client/projects?email=${encodeURIComponent(
              user.email
            )}`
          ),
          fetch(
            `${getApiUrl()}/client/tickets?email=${encodeURIComponent(
              user.email
            )}`
          ),
        ]);

        let activeProjectsCount = 0;
        let activeTicketsCount = 0;
        let mappedProjects = [];

        if (projRes.ok) {
          const data = await projRes.json();
          mappedProjects = data.map((p) => ({
            id: p.id,
            title: `${p.plan} Project`,
            status: p.status,
            phases: [
              // Mock phases
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
          }));
          activeProjectsCount = data.filter(
            (p) => p.status !== "completed" && p.status !== "rejected"
          ).length;
          setProjects(mappedProjects);
        }

        if (tickRes.ok) {
          const data = await tickRes.json();
          activeTicketsCount = data.filter(
            (t) => t.status !== "Resolved" && t.status !== "Closed"
          ).length;
        }

        setStats({
          activeProjects: activeProjectsCount,
          invoicesDue: 0, // Not implemented
          tickets: activeTicketsCount,
          status: "Online",
        });
      } catch (e) {
        console.error("Dashboard fetch failed", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user.email]);

  const statCards = [
    {
      label: "Active Projects",
      val: stats.activeProjects,
      icon: Icons.Code,
      id: "projects",
    },
    {
      label: "Invoices Due",
      val: `GH₵ ${stats.invoicesDue.toFixed(2)}`,
      icon: Icons.CreditCard,
      id: "billing",
    },
    {
      label: "Support Tickets",
      val: stats.tickets,
      icon: Icons.LifeBuoy,
      id: "support",
    },
    {
      label: "System Status",
      val: stats.status,
      icon: Icons.Activity,
      textClass: "text-green-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const isClickable = !!stat.id;

          return (
            <div
              key={i}
              onClick={(e) => {
                if (isClickable) {
                  e.preventDefault();
                  setActiveTab(stat.id);
                }
              }}
              role={isClickable ? "button" : "presentation"}
              tabIndex={isClickable ? 0 : undefined}
              className={`bg-white dark:bg-akatech-card p-6 border-l-4 border-akatech-gold shadow-md dark:shadow-none transition-all duration-300 transform hover:-translate-y-1 h-full ${
                isClickable
                  ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
                  {stat.label}
                </span>
                <stat.icon className="text-akatech-gold w-5 h-5" />
              </div>
              <div
                className={`text-2xl font-serif font-bold text-gray-900 dark:text-white ${
                  stat.textClass || ""
                }`}
              >
                {stat.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Project Timeline Preview */}
        <div className="xl:col-span-2 bg-white dark:bg-akatech-card p-6 md:p-8 rounded-xl border border-gray-100 dark:border-white/5 shadow-lg dark:shadow-none transition-all duration-500 h-full flex flex-col">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 dark:border-white/5 pb-4">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-white">
              Project Timeline
            </h2>
            <button
              onClick={() => setActiveTab("projects")}
              className="text-akatech-gold text-xs font-bold uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>

          {/* Simple Timeline for the first active project */}
          <div className="flex-1 overflow-y-auto pr-2">
            {projects[0] ? (
              <div className="space-y-10 pl-6 border-l-2 border-akatech-gold/20 relative ml-2">
                {projects[0].phases.map((phase, i) => (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-[29px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-akatech-card shadow-sm ${
                        phase.status === "Completed" ||
                        phase.status === "In Progress"
                          ? "bg-akatech-gold"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    ></div>
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">
                        {phase.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-xs font-mono">
                          {phase.date}
                        </p>
                        <span
                          className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold ${
                            phase.status === "In Progress"
                              ? "bg-akatech-gold/20 text-akatech-gold"
                              : phase.status === "Completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {phase.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Icons.Folder className="w-12 h-12 mb-4 opacity-20" />
                <p>No active projects found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-akatech-card rounded-xl border border-gray-100 dark:border-white/5 p-6 md:p-8 flex flex-col shadow-lg dark:shadow-none transition-all duration-500 h-full">
          <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
            Quick Actions
          </h2>
          <div className="space-y-4 flex-1">
            <button
              onClick={() => setActiveTab("billing")}
              className="w-full group text-left p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-akatech-gold/30 hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 flex items-center gap-4"
            >
              <div className="bg-white dark:bg-akatech-dark p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Icons.Plus className="w-5 h-5 text-akatech-gold" />
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">
                  Create Invoice
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Request new invoice
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className="w-full group text-left p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-akatech-gold/30 hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 flex items-center gap-4"
            >
              <div className="bg-white dark:bg-akatech-dark p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Icons.Settings className="w-5 h-5 text-akatech-gold" />
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">
                  Update Profile
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Manage account details
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className="w-full group text-left p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-akatech-gold/30 hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 flex items-center gap-4"
            >
              <div className="bg-white dark:bg-akatech-dark p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Icons.LifeBuoy className="w-5 h-5 text-akatech-gold" />
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">
                  Contact Support
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Get help with your project
                </span>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 transition-colors duration-500">
            <div className="flex items-center gap-2 justify-center opacity-50">
              <div className="flex items-center justify-center relative w-8 h-8 grayscale">
                <img
                  src="/logo.png"
                  alt="AkaTech Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                AkaTech System v2.4.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
