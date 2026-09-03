import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Dynamic base URL for Vercel / GitHub Pages / local
  base: process.env.VITE_BASE_URL || (process.env.VERCEL ? "/" : "/jobsphere/"),

  server: {
    proxy: {
      // Backend (Port 5005) par API requests bhejne ke liye
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