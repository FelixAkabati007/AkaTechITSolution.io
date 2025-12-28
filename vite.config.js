import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./AkaTech_Components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Referrer-Policy": "no-referrer-when-downgrade",
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
      },
      "/socket.io": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "framer-motion"],
          ui: ["lucide-react", "clsx", "tailwind-merge"],
          spline: ["@splinetool/react-spline", "@splinetool/runtime"],
          pdf: ["jspdf"],
          realtime: ["socket.io-client"],
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./vitest.setup.js",
    css: true,
  },
});
