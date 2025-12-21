import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { Avatar } from "@components/ui/Avatar";
import { ClientDashboard } from "./ClientDashboard";
import { ClientProjects } from "./ClientProjects";
import { ClientBilling } from "./ClientBilling";
import { ClientSupport } from "./ClientSupport";
import { ClientProfile } from "./ClientProfile";

export const ClientLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.LayoutDashboard },
    { id: "projects", label: "My Projects", icon: Icons.Briefcase },
    { id: "billing", label: "Billing", icon: Icons.CreditCard },
    { id: "support", label: "Support", icon: Icons.LifeBuoy },
    { id: "profile", label: "Profile", icon: Icons.User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ClientDashboard user={user} setActiveTab={setActiveTab} />;
      case "projects":
        return <ClientProjects user={user} />;
      case "billing":
        return <ClientBilling user={user} />;
      case "support":
        return <ClientSupport user={user} />;
      case "profile":
        return <ClientProfile user={user} />;
      default:
        return <ClientDashboard user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-akatech-dark flex transition-colors duration-500">
      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={
          isMobile
            ? { x: isSidebarOpen ? 0 : "-100%", width: 260 }
            : { width: isSidebarOpen ? 260 : 80, x: 0 }
        }
        transition={{ duration: 0.3, bounce: 0 }}
        className="bg-white dark:bg-akatech-card border-r border-gray-200 dark:border-white/10 flex flex-col fixed inset-y-0 left-0 h-full z-40 shadow-xl md:relative md:shadow-lg md:translate-x-0"
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/10">
          {isSidebarOpen ? (
            <span className="text-xl font-serif font-bold text-gray-900 dark:text-white">
              Client Portal
            </span>
          ) : (
            <span className="text-xl font-serif font-bold text-akatech-gold mx-auto">
              C
            </span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-akatech-gold transition-colors"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? (
              <Icons.ChevronLeft className="w-5 h-5" />
            ) : (
              <Icons.ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                activeTab === item.id
                  ? "bg-akatech-gold text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  activeTab === item.id
                    ? "text-white"
                    : "group-hover:text-akatech-gold"
                }`}
              />

              {isSidebarOpen && (
                <span
                  className={`font-medium text-sm whitespace-nowrap ${
                    activeTab === item.id ? "text-white" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <div
            className={`flex items-center gap-3 ${
              !isSidebarOpen && "justify-center"
            }`}
          >
            <Avatar
              src={user.avatarUrl}
              fallback={user.name}
              size="sm"
              className="shrink-0"
            />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Client Account
                </p>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <Icons.LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-gray-100 dark:bg-[#0a0a0a] relative">
        <header className="h-20 bg-white/80 dark:bg-akatech-card/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 dark:border-white/10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-akatech-gold transition-colors"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
              {menuItems.find((i) => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-akatech-gold transition-colors relative">
              <Icons.Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-akatech-card"></span>
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
