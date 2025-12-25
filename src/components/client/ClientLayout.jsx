import React, { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { Icons } from "@components/ui/Icons";
import { Avatar } from "@components/ui/Avatar";
import { ClientDashboard } from "./ClientDashboard";
import { ClientProjects } from "./ClientProjects";
import { ClientBilling } from "./ClientBilling";
import { ClientSupport } from "./ClientSupport";
import { ClientProfile } from "./ClientProfile";

export const ClientLayout = ({ user, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Notification fetch error:", err);
        // Fallback to empty or keep error state
        setNotificationError("Failed to load notifications");
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();

    // Setup socket listener for real-time notifications
    const socket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to notification socket");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socket.on("notification", (newNotification) => {
      if (
        newNotification.recipientId === "all" ||
        (user && newNotification.recipientId === user.id)
      ) {
        setNotifications((prev) => [newNotification, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const markAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:3001/api/notifications/read-all",
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to mark all read");

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
      setNotificationError("Failed to update status");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

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
        return <ClientProfile user={user} onUserUpdate={onUserUpdate} />;
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
          <div className="flex items-center gap-4" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 transition-colors relative rounded-full hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-akatech-gold ${
                showNotifications
                  ? "text-akatech-gold bg-gray-100 dark:bg-white/10"
                  : "text-gray-500 hover:text-akatech-gold"
              }`}
              aria-label={`Notifications ${
                unreadCount > 0 ? `(${unreadCount} unread)` : ""
              }`}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Icons.Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-akatech-card animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-4 mt-2 w-80 sm:w-96 bg-white dark:bg-akatech-card rounded-lg shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        disabled={isMarkingAll}
                        aria-label="Mark all notifications as read"
                        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                          isMarkingAll
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-akatech-gold hover:text-akatech-goldDark focus:outline-none focus:underline"
                        }`}
                      >
                        {isMarkingAll && (
                          <Icons.Loader className="w-3 h-3 animate-spin" />
                        )}
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="p-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Icons.Loader className="w-8 h-8 animate-spin mb-2 text-akatech-gold" />
                        <p className="text-sm">Loading notifications...</p>
                      </div>
                    ) : notificationError ? (
                      <div className="p-8 flex flex-col items-center justify-center text-red-500 text-center">
                        <Icons.AlertCircle className="w-8 h-8 mb-2" />
                        <p className="text-sm font-bold">Error</p>
                        <p className="text-xs">{notificationError}</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative ${
                              !notification.read
                                ? "bg-blue-50/30 dark:bg-blue-900/10"
                                : ""
                            }`}
                          >
                            {!notification.read && (
                              <span className="absolute left-0 top-0 bottom-0 w-1 bg-akatech-gold"></span>
                            )}
                            <div className="flex gap-3">
                              <div
                                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                  notification.type === "success"
                                    ? "bg-green-500"
                                    : notification.type === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`text-sm font-bold mb-0.5 ${
                                    !notification.read
                                      ? "text-gray-900 dark:text-white"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1">
                                  {notification.message}
                                </p>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {notification.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-center">
                    <button className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-akatech-gold"></div>
                  </div>
                }
              >
                {renderContent()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
