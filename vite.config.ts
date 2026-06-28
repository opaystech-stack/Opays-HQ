import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // En dev, on proxifie les appels API vers le serveur Express afin que le SPA
    // et l'API partagent la même origine. Indispensable pour que les cookies de
    // session HttpOnly/SameSite=Strict soient envoyés sur les requêtes XHR.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
      routeFileIgnorePattern: "\\.test\\.tsx?$",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
