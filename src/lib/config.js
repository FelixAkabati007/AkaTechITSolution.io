export const getApiUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    // Debug log to verify environment detection
    console.log(`[Config] Hostname: ${hostname}, isLocalhost: ${isLocalhost}`);

    if (!isLocalhost) {
      // In production (Vercel), use relative path to hit the API proxy
      // This prevents Mixed Content and Private Network Access errors
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
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (!isLocalhost) {
      // In production, try relative path (or use a dedicated WS host)
      // Vercel Serverless doesn't support persistent WS, but this avoids localhost errors
      return "/";
    }
  }

  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  return "http://localhost:3001";
};
