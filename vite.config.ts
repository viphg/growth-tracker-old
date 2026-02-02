import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import pwaRegister from "./vite-plugin-pwa-register";

export default defineConfig({
  plugins: [react(), pwaRegister()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
