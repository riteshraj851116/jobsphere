import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // URL mein '/jobsphere/' laane ke liye (GitHub Pages ke liye zaroori hai)
  base: "/jobsphere/",

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