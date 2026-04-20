import type { PostHog } from "posthog-js";

/**
 * Module-level singleton reference to the PostHog client.
 * AnalyticsProvider calls `setClient` on mount so that `track()` calls from
 * anywhere in the app (including outside React) resolve to the real client.
 */
let phClient: PostHog | null = null;

export function setClient(client: PostHog | null): void {
  phClient = client;
}

export function getClient(): PostHog | null {
  return phClient;
}
