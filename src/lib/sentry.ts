import * as Sentry from "@sentry/react";

let isSentryInitialized = false;

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || isSentryInitialized) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
  });

  isSentryInitialized = true;
}
