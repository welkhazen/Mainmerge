import { createRoot } from "react-dom/client";
import { PostHogProvider } from "@posthog/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initSentry } from "@/lib/sentry";
import { initPostHog } from "@/lib/posthog";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

initSentry();
initPostHog();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <PostHogProvider apiKey="phc_C6VjShPz9cMttT9XWJeXAnPTf8wGJDTgkzd3hchT98KA" options={{ api_host: 'https://eu.i.posthog.com' }}>
        <App />
      </PostHogProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
