import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@components/ui/Icons";
import { saveCookiePreferences, getCookiePreferences } from "@lib/cookieUtils";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true and disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const storedPrefs = getCookiePreferences();
    if (!storedPrefs) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPrefs = { essential: true, analytics: true, marketing: true };
    saveCookiePreferences(allPrefs);
    setPreferences(allPrefs);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const minPrefs = { essential: true, analytics: false, marketing: false };
    saveCookiePreferences(minPrefs);
    setPreferences(minPrefs);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setIsVisible(false);
  };

  const togglePreference = (key) => {
    if (key === "essential") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[10000] p-4 md:p-6"
        >
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {!showCustomize ? (
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-akatech-gold/10 rounded-lg">
                      <Icons.Cookie className="w-6 h-6 text-akatech-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      We value your privacy
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    We use cookies to enhance your browsing experience, serve
                    personalized ads or content, and analyze our traffic. By
                    clicking "Accept All", you consent to our use of cookies.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Customize
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-akatech-gold text-white hover:bg-akatech-goldDark shadow-lg shadow-akatech-gold/20 transition-all"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Icons.Settings className="w-5 h-5" />
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        Essential Cookies
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Required for basic site functionality. Cannot be disabled.
                      </p>
                    </div>
                    <div className="w-12 h-6 bg-akatech-gold/50 rounded-full relative cursor-not-allowed opacity-70">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        Analytics Cookies
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference("analytics")}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        preferences.analytics
                          ? "bg-akatech-gold"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                          preferences.analytics ? "right-1" : "left-1"
                        }`}
                      ></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        Marketing Cookies
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Used to display ads relevant to your interests.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference("marketing")}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        preferences.marketing
                          ? "bg-akatech-gold"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                          preferences.marketing ? "right-1" : "left-1"
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="px-6 py-2 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-akatech-gold text-white hover:bg-akatech-goldDark shadow-lg shadow-akatech-gold/20 transition-all"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
