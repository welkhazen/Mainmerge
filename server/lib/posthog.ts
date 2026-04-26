import { PostHog } from 'posthog-node';
import { env } from '../config/env';

const posthogApiKey = env.POSTHOG_API_KEY;
const posthogHost = env.POSTHOG_HOST;

if (!posthogApiKey) {
  console.warn('[PostHog] Missing POSTHOG_API_KEY. PostHog will not be initialized.');
}

export const posthog = posthogApiKey 
  ? new PostHog(posthogApiKey, { host: posthogHost })
  : null;

// Ensure PostHog flushes events before process exit
process.on('exit', () => {
  if (posthog) {
    posthog.shutdown();
  }
});
