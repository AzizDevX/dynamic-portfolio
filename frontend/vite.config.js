import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "localhost",
    port: 3001,
    cors: true,
    strictPort: true,
    hmr: {
      port: 3002,
    },
    open: false,
  },
  preview: {
    historyApiFallback: true,
    port: process.env.PORT || 3000,
  },
  build: {
    outDir: "dist/client",
    sourcemap: false, // Disable sourcemap to avoid tailwind warnings
    target: "esnext",
    rollupOptions: {
      input: "./index.html",
    },
    assetsDir: "assets",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
    "process.env.VITE_BACKEND_ROOT_URL": JSON.stringify(
      process.env.VITE_BACKEND_ROOT_URL
    ),
    "process.env.VITE_FRONTEND_ADMIN_URL": JSON.stringify(
      process.env.VITE_FRONTEND_ADMIN_URL
    ),
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react-router-dom"],
  },
});
