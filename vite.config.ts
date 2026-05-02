import { defineConfig } from "vite";
import reactOxc from "@vitejs/plugin-react-oxc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "node:child_process";

function readAppVersion(): string {
  if (process.env.VITE_APP_VERSION) {
    return process.env.VITE_APP_VERSION;
  }
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  plugins: [reactOxc(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(readAppVersion()),
  },
}));
