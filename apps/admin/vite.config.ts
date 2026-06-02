import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/admin/",
  plugins: [react(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
  },
  // Support for path-based hosting under /admin/ on Vercel
  // Admin assets will be served from /admin/ when deployed.
});
