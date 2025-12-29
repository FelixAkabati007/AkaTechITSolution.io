import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { useOnlineStatus } from "@hooks/useOnlineStatus";

// Lazy load Spline to avoid heavy initial load
const Spline = React.lazy(() => import("@splinetool/react-spline"));

export const FloatingAssistant = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const online = useOnlineStatus();

  React.useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || window.opera || "";
      // Strict mobile check to avoid false positives on desktops
      const isMobileUA =
        /android|ipad|iphone|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );
      const isSmallScreen = window.innerWidth < 768;

      const newIsMobile = isMobileUA || isSmallScreen;
      setIsMobile(newIsMobile);

      // Reset error/loaded state when switching to desktop to allow retry
      if (!newIsMobile) {
        setHasError(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    window.open(
      "https://wa.me/233244027477?text=Hello%20AkaTech%20IT%20Solutions,%20I%20would%20like%20to%20inquire%20about%20your%20services.&utm_source=floating_assistant",
      "_blank"
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex items-center justify-center">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="absolute right-full mr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 whitespace-nowrap text-sm font-bold"
          >
            Chat with us
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 rotate-45 border-r border-t border-gray-100 dark:border-gray-700"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -5, 0],
          boxShadow: [
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          ],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
          scale: {
            duration: 0.3,
            ease: "easeOut",
          },
        }}
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-gray-800 shadow-2xl border-2 border-akatech-gold/20 overflow-hidden cursor-pointer group"
        aria-label="Chat with our AI Assistant on WhatsApp"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-akatech-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Spline Viewer */}
        {hasError || isMobile || !online ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-akatech-gold/10 to-akatech-gold/30 dark:from-akatech-gold/20 dark:to-akatech-gold/5 text-akatech-gold">
            <Icons.Bot size={32} />
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Show Icon while loading for seamless transition */}
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-akatech-gold/10 to-akatech-gold/30 dark:from-akatech-gold/20 dark:to-akatech-gold/5 text-akatech-gold transition-opacity duration-300">
                <Icons.Bot size={32} />
              </div>
            )}
            <Suspense fallback={null}>
              <Spline
                scene="https://prod.spline.design/gg8wAlCUGNYmIMlR/scene.splinecode"
                className={`w-full h-full transform scale-125 translate-y-2 transition-opacity duration-500 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
              />
            </Suspense>
          </div>
        )}
      </motion.button>
    </div>
  );
};
