import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./vitest.setup.js",
    css: true,
    coverage: {
      provider: "v8",
      reports: ["html", "text", "json-summary"],
      all: true,
      exclude: ["node_modules", "docs", "scripts"],
    },
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./AkaTech_Components"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
});
