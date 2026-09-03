import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Base URL: "/" for Vercel and local; "/jobsphere/" only when building on GitHub Actions
  base: process.env.VITE_BASE_URL || (process.env.GITHUB_ACTIONS === "true" ? "/jobsphere/" : "/"),

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5005", 
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
  },
});