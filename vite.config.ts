import { defineConfig } from "vite";
import path from "path";
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

async function loadReactPlugin() {
  try {
    const { default: reactOxc } = await import("@vitejs/plugin-react-oxc");
    return reactOxc();
  } catch {
    try {
      const { default: react } = await import("@vitejs/plugin-react");
      return react();
    } catch {
      return null;
    }
  }
}

async function loadComponentTagger(mode: string) {
  if (mode !== "development") {
    return null;
  }
  try {
    const { componentTagger } = await import("lovable-tagger");
    return componentTagger();
  } catch {
    return null;
  }
}

export default defineConfig(async ({ mode }) => {
  const reactPlugin = await loadReactPlugin();
  const taggerPlugin = await loadComponentTagger(mode);

  return {
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
    plugins: [reactPlugin, taggerPlugin].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(readAppVersion()),
    },
  };
});
