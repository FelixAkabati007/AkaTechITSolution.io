export const getApiUrl = () => {
  // Check if running in browser environment first to override env vars if needed
  if (typeof window !== "undefined") {
    // If we are NOT on localhost, force relative path to avoid Mixed Content / Private Network Access issues
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost) {
      return "/api";
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return "http://localhost:3001/api";
};

export const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost) {
      // In production (Vercel), we might not have a socket server unless it's a separate deployment.
      // But if we want to try relative path (unlikely to work for WS on Vercel Serverless, but better than localhost):
      return "/";
      // Note: Vercel Serverless doesn't support persistent WebSockets.
      // You need a separate socket host (e.g. Railway/Render) or use polling.
      // For now, returning "/" attempts to connect to the same domain.
    }
  }

  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  return "http://localhost:3001";
};
