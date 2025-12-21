import React, { useEffect, useState } from "react";
import { Icons } from "@components/ui/Icons";
import { mockService } from "@lib/mockData";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    totalRevenue: 0,
    pendingTickets: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      // if (!token) return; // Allow rendering with 0 if no token
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch projects and tickets
        const [projectsRes, ticketsRes] = await Promise.all([
          fetch("http://localhost:3001/api/projects", { headers }),
          fetch("http://localhost:3001/api/tickets", { headers }),
        ]);

        const projects = projectsRes.ok ? await projectsRes.json() : [];
        const tickets = ticketsRes.ok ? await ticketsRes.json() : [];

        setStats({
          totalUsers: 0, // Users API not yet implemented
          activeProjects: projects.filter(
            (p) => p.status !== "completed" && p.status !== "rejected"
          ).length,
          totalRevenue: 0, // Invoices API not yet implemented
          pendingTickets: tickets.filter(
            (t) => t.status !== "resolved" && t.status !== "closed"
          ).length,
        });
      } catch (e) {
        console.error("Dashboard fetch failed", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      label: "Total Users",
      val: stats.totalUsers,
      icon: Icons.Users,
      change: "+12%",
    },
    {
      label: "Active Projects",
      val: stats.activeProjects,
      icon: Icons.Briefcase,
      change: "+5%",
    },
    {
      label: "Total Revenue",
      val: `GH₵ ${stats.totalRevenue.toLocaleString()}`,
      icon: Icons.CreditCard,
      change: "+24%",
    },
    {
      label: "Pending Tickets",
      val: stats.pendingTickets,
      icon: Icons.LifeBuoy,
      change: "-2%",
      isNegative: false,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
        Admin Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-akatech-card p-6 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs uppercase tracking-widest">
                {stat.label}
              </span>
              <div className="p-2 bg-akatech-gold/10 rounded-lg text-akatech-gold">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.val}
              </span>
              <span
                className={`text-xs font-medium mb-1 ${
                  stat.isNegative ? "text-red-500" : "text-green-500"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-akatech-card p-6 rounded-lg border border-gray-200 dark:border-white/10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-akatech-gold shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    New project "E-Commerce Revamp" created
                  </p>
                  <p className="text-xs text-gray-500">
                    2 hours ago • by Admin
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-akatech-card p-6 rounded-lg border border-gray-200 dark:border-white/10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            System Health
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Server Load
                </span>
                <span className="text-green-500 font-bold">24%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[24%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Memory Usage
                </span>
                <span className="text-akatech-gold font-bold">58%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-akatech-gold w-[58%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Database Storage
                </span>
                <span className="text-blue-500 font-bold">45%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
