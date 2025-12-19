// Cookie Management Utilities

const COOKIE_CONSENT_KEY = "akatech_cookie_consent";
const AUDIT_LOG_KEY = "akatech_cookie_audit_log";

/**
 * Sets a cookie with specified name, value, and options.
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration in days
 * @param {Object} options - Additional options (secure, samesite)
 */
export const setCookie = (name, value, days = 7, options = {}) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  
  const secure = options.secure || location.protocol === 'https:' ? "; Secure" : "";
  const sameSite = "; SameSite=" + (options.sameSite || "Lax");
  
  // Note: HttpOnly cannot be set via client-side JavaScript, 
  // but we document intent here. Real HttpOnly cookies must come from server.
  
  document.cookie = name + "=" + (value || "") + expires + "; path=/" + secure + sameSite;
  
  logCookieAction("SET", name);
};

/**
 * Gets a cookie value by name.
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
};

/**
 * Erases a cookie by name.
 * @param {string} name - Cookie name
 */
export const eraseCookie = (name) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  logCookieAction("ERASE", name);
};

/**
 * Saves user cookie preferences.
 * @param {Object} preferences - { essential: boolean, analytics: boolean, marketing: boolean }
 */
export const saveCookiePreferences = (preferences) => {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    timestamp: new Date().toISOString(),
    preferences
  }));
  logCookieAction("CONSENT_UPDATE", "preferences", preferences);
};

/**
 * Retrieves user cookie preferences.
 * @returns {Object|null} - User preferences or null if not set
 */
export const getCookiePreferences = () => {
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Logs cookie related actions for audit purposes.
 * @param {string} action - Action type (SET, ERASE, CONSENT_UPDATE)
 * @param {string} target - Cookie name or target
 * @param {any} details - Additional details
 */
const logCookieAction = (action, target, details = null) => {
  const logEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    target,
    details,
    userAgent: navigator.userAgent
  };
  
  const currentLog = getAuditLog();
  currentLog.unshift(logEntry);
  
  // Keep last 100 entries
  if (currentLog.length > 100) currentLog.pop();
  
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(currentLog));
};

/**
 * Retrieves the audit log.
 * @returns {Array} - Array of log entries
 */
export const getAuditLog = () => {
  const stored = localStorage.getItem(AUDIT_LOG_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Clears the audit log (Admin only).
 */
export const clearAuditLog = () => {
  localStorage.removeItem(AUDIT_LOG_KEY);
};
