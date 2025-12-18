import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";

export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-md p-4 transition-colors duration-500">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-akatech-card border border-gray-200 dark:border-akatech-gold/30 w-full max-w-md p-6 md:p-10 relative shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto no-scrollbar transition-colors duration-500"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white transition z-10"
            >
              <Icons.X className="w-6 h-6" />
            </button>

            {title && (
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-2 transition-colors duration-500">
                  {title}
                </h2>
                <div className="h-[1px] w-12 bg-akatech-gold"></div>
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
