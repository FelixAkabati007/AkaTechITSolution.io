import React, { useState, useEffect } from "react";
import { Icons } from "@components/ui/Icons";
import { getAuditLog, clearAuditLog } from "@lib/cookieUtils";
import { mockService } from "@lib/mockData";

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "AkaTech IT Solutions",
    emailNotifications: true,
    maintenanceMode: false,
    theme: "light",
    adminEmail: "admin@akatech.com",
    cookiePolicyVersion: "1.0.0",
    enforceSecureCookies: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    setAuditLog(getAuditLog());
    const loadedSettings = mockService.getSettings();
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  }, []);

  const handleClearAuditLog = () => {
    clearAuditLog();
    setAuditLog([]);
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 800));
      mockService.saveSettings(settings);
      setSaveMessage({ type: "success", text: "Settings saved successfully!" });

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">
          System Settings
        </h2>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <span
              role="status"
              className={`text-sm font-medium animate-in fade-in slide-in-from-right-5 duration-300 ${
                saveMessage.type === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {saveMessage.text}
            </span>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-akatech-gold text-white px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-akatech-goldDark transition-colors flex items-center gap-2 shadow-lg shadow-akatech-gold/20 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-akatech-gold outline-none"
            aria-label={isSaving ? "Saving changes..." : "Save changes"}
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icons.CheckCircle className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-akatech-card p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-akatech-gold/10 rounded-lg">
              <Icons.Settings className="w-6 h-6 text-akatech-gold" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              General Configuration
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-akatech-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleChange("adminEmail", e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-akatech-gold outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notifications & System */}
        <div className="bg-white dark:bg-akatech-card p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Icons.Bell className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notifications & System
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive updates on new tickets
                </p>
              </div>
              <button
                onClick={() => handleToggle("emailNotifications")}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.emailNotifications
                    ? "bg-akatech-gold"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.emailNotifications
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Maintenance Mode
                </p>
                <p className="text-xs text-gray-500">
                  Disable public access temporarily
                </p>
              </div>
              <button
                onClick={() => handleToggle("maintenanceMode")}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.maintenanceMode
                    ? "bg-red-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        {/* Cookie Management */}
        <div className="bg-white dark:bg-akatech-card p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Icons.Cookie className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Cookie Management & Compliance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Enforce Secure Cookies
                  </p>
                  <p className="text-xs text-gray-500">
                    Force HttpOnly and Secure flags
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("enforceSecureCookies")}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings.enforceSecureCookies
                      ? "bg-akatech-gold"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      settings.enforceSecureCookies
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Policy Version
                </label>
                <input
                  type="text"
                  value={settings.cookiePolicyVersion}
                  onChange={(e) =>
                    handleChange("cookiePolicyVersion", e.target.value)
                  }
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-akatech-gold outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg border border-gray-200 dark:border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                  Audit Log (Last 100 Actions)
                </h4>
                <button
                  onClick={handleClearAuditLog}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Clear Log
                </button>
              </div>
              <div className="h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {auditLog.length > 0 ? (
                  auditLog.map((log) => (
                    <div
                      key={log.id}
                      className="text-xs p-2 bg-white dark:bg-white/5 rounded border border-gray-100 dark:border-white/5"
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {log.action}
                        </span>
                        <span className="text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-500 truncate">
                        Target: {log.target}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-xs py-10">
                    No activity recorded
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
