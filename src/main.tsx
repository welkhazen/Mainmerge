import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PostHogProvider } from "posthog-js/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track } from "@/lib/analytics";
import { initSentry } from "@/lib/sentry";
import App from "./App.tsx";
import "./index.css";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  defaults: "2026-01-30",
} as const;

const posthogApiKey = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const queryClient = new QueryClient();

initSentry();

if (typeof window !== "undefined" && import.meta.env.DEV) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("analytics_test") === "1") {
    track("diagnostics_probe_fired", {
      source: "query_param",
      mode: import.meta.env.MODE,
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {posthogApiKey ? (
          <PostHogProvider apiKey={posthogApiKey} options={options}>
            <App />
          </PostHogProvider>
        ) : (
          <App />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
