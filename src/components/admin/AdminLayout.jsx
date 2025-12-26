import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { Logo } from "@components/ui/Logo";
import { getApiUrl } from "@lib/config";

import { AdminDashboard } from "./AdminDashboard";
import { AdminClients } from "./AdminClients";
import { AdminBilling } from "./AdminBilling";
import { AdminSupport } from "./AdminSupport";
import { AdminSettings } from "./AdminSettings";
import { AdminProfile } from "./AdminProfile";
import { AdminProjects } from "./AdminProjects";
import { AdminMessages } from "./AdminMessages";
import { AdminSubscriptions } from "./AdminSubscriptions";
import { AdminNotifications } from "./AdminNotifications";

export const AdminLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  React.useEffect(() => {
    const loginAdmin = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password: "admin123" }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("adminToken", data.token);
        }
      } catch (e) {
        console.error("Admin auto-login failed", e);
      }
    };

    // Always refresh token on mount for this demo
    loginAdmin();
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.LayoutDashboard },
    { id: "messages", label: "Messages", icon: Icons.MessageSquare },
    { id: "notifications", label: "Notifications", icon: Icons.Bell },
    { id: "clients", label: "Clients", icon: Icons.Users },
    { id: "projects", label: "Projects", icon: Icons.Briefcase },
    { id: "subscriptions", label: "Subscriptions", icon: Icons.CreditCard },
    { id: "billing", label: "Billing", icon: Icons.CreditCard },
    { id: "support", label: "Support", icon: Icons.LifeBuoy },
    { id: "settings", label: "Settings", icon: Icons.Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard user={user} />;
      case "messages":
        return <AdminMessages />;
      case "notifications":
        return <AdminNotifications />;
      case "clients":
        return <AdminClients />;
      case "projects":
        return <AdminProjects />;
      case "subscriptions":
        return <AdminSubscriptions />;
      case "billing":
        return <AdminBilling />;
      case "support":
        return <AdminSupport />;
      case "settings":
        return <AdminSettings />;
      case "profile":
        return <AdminProfile user={user} />;
      default:
        return <AdminDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-akatech-dark flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 80,
          x: 0,
        }}
        className={`bg-white dark:bg-akatech-card border-r border-gray-200 dark:border-white/5 flex-col z-40
          ${
            isMobileSidebarOpen
              ? "fixed inset-y-0 left-0 flex w-[280px] shadow-2xl"
              : "hidden md:flex relative flex-shrink-0"
          }
        `}
      >
        <div className="p-6 flex items-center gap-4 h-20 border-b border-gray-200 dark:border-white/5">
          <Logo className="w-8 h-8 flex-shrink-0" />
          <AnimatePresence>
            {(isSidebarOpen || isMobileSidebarOpen) && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-serif font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap"
              >
                AkaTech Admin
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-akatech-gold text-black shadow-lg shadow-akatech-gold/20"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${
                  activeTab === item.id ? "text-black" : ""
                }`}
              />
              <AnimatePresence>
                {(isSidebarOpen || isMobileSidebarOpen) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium text-sm whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Icons.LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {(isSidebarOpen || isMobileSidebarOpen) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium text-sm"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute -right-3 top-24 bg-white dark:bg-akatech-card border border-gray-200 dark:border-white/10 p-1.5 rounded-full shadow-md text-gray-500 hover:text-akatech-gold transition-colors"
        >
          {isSidebarOpen ? (
            <Icons.ChevronLeft className="w-3 h-3" />
          ) : (
            <Icons.ChevronRight className="w-3 h-3" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className="h-20 bg-white/80 dark:bg-akatech-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 sticky top-0 z-10 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-akatech-gold transition-colors"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-serif text-gray-900 dark:text-white">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              aria-label="User menu"
              className="flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded-lg transition-colors group outline-none focus:ring-2 focus:ring-akatech-gold"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-akatech-gold transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.role || "Admin"}</p>
              </div>
              <div className="w-10 h-10 bg-akatech-gold rounded-full flex items-center justify-center text-black font-bold ring-2 ring-white/10 shadow-lg group-hover:shadow-akatech-gold/20 transition-all overflow-hidden relative">
                <span className="absolute inset-0 flex items-center justify-center">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                {user.avatarUrl && (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.name}'s profile`}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
              </div>
              <Icons.ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                  isProfileOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-akatech-card rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || "admin@akatech.com"}
                      </p>
                    </div>
                    <div role="menu" aria-label="User profile options">
                      <div className="p-2">
                        <button
                          role="menuitem"
                          onClick={() => {
                            setActiveTab("profile");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-akatech-gold transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-white/5"
                        >
                          <Icons.User className="w-4 h-4" /> Profile
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => {
                            setActiveTab("settings");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-akatech-gold transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-white/5"
                        >
                          <Icons.Settings className="w-4 h-4" /> Settings
                        </button>
                      </div>
                      <div className="p-2 border-t border-gray-200 dark:border-white/5">
                        <button
                          role="menuitem"
                          onClick={onLogout}
                          className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/10"
                        >
                          <Icons.LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-akatech-gold"></div>
              </div>
            }
          >
            {renderContent()}
          </Suspense>
        </div>
      </main>
    </div>
  );
};
