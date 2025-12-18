import React, { createContext, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "@components/ui/Icons";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.9,
                transition: { duration: 0.2 },
              }}
              className={`pointer-events-auto min-w-[300px] p-4 rounded-lg shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-white/90 dark:bg-[#1a1a1a]/90 border-green-500/30 text-green-700 dark:text-green-400"
                  : "bg-white/90 dark:bg-[#1a1a1a]/90 border-akatech-gold/30 text-gray-800 dark:text-white"
              }`}
            >
              {toast.type === "success" ? (
                <Icons.Success size={20} />
              ) : (
                <Icons.Info size={20} />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-auto opacity-50 hover:opacity-100 transition-opacity"
              >
                <Icons.X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
