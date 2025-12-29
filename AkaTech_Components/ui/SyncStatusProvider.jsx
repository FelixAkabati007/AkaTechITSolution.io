import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";

const SyncStatusContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const SyncStatusProvider = ({ children }) => {
  const [status, setStatus] = useState("connecting"); // connecting, synced, syncing, error, offline
  const [lastSync, setLastSync] = useState(null);
  const [socket, setSocket] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setStatus("synced");
      setLastSync(new Date());
    });

    newSocket.on("disconnect", (reason) => {
      setStatus("offline");
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (err) => {
      setStatus("error");
      setErrorMessage("Connection failed");
    });

    newSocket.on("heartbeat", (data) => {
      setStatus("synced");
      setLastSync(new Date(data.timestamp));
    });

    // Listen for data events to show "Syncing..." state
    const dataEvents = [
      "new_invoice_request",
      "invoice_paid",
      "invoice_generated",
      "invoice_created",
      "invoice_updated",
      "new_message",
      "new_project",
      "user_registered",
    ];

    dataEvents.forEach((event) => {
      newSocket.on(event, () => {
        setStatus("syncing");
        // Revert to synced after a short delay to show the activity
        setTimeout(() => {
          setStatus((prev) => (prev === "syncing" ? "synced" : prev));
          setLastSync(new Date());
        }, 1500);
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const getStatusDisplay = () => {
    switch (status) {
      case "syncing":
        return {
          icon: <Icons.Loader className="animate-spin" size={16} />,
          text: "Syncing...",
          color: "text-blue-500",
          bg: "bg-blue-500/10 border-blue-500/20",
        };
      case "synced":
        return {
          icon: <Icons.CheckCircle size={16} />,
          text: "Synced",
          color: "text-green-500",
          bg: "bg-green-500/10 border-green-500/20",
        };
      case "error":
        return {
          icon: <Icons.AlertTriangle size={16} />,
          text: "Sync Failed",
          color: "text-red-500",
          bg: "bg-red-500/10 border-red-500/20",
        };
      case "offline":
        return {
          icon: <Icons.Server size={16} />,
          text: "Offline",
          color: "text-gray-500",
          bg: "bg-gray-500/10 border-gray-500/20",
        };
      default:
        return {
          icon: <Icons.Loader className="animate-spin" size={16} />,
          text: "Connecting...",
          color: "text-yellow-500",
          bg: "bg-yellow-500/10 border-yellow-500/20",
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <SyncStatusContext.Provider value={{ status, lastSync, socket }}>
      {children}
      <div className="fixed bottom-6 left-6 z-[100] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`pointer-events-auto px-3 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 shadow-lg transition-colors duration-300 ${display.bg} ${display.color}`}
        >
          {display.icon}
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold">{display.text}</span>
            {lastSync && status === "synced" && (
              <span className="text-[10px] opacity-70">
                {lastSync.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </SyncStatusContext.Provider>
  );
};

export const useSyncStatus = () => useContext(SyncStatusContext);
