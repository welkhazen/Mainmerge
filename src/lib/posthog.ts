import posthog from 'posthog-js';

const posthogApiKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

if (posthogApiKey && typeof window !== 'undefined') {
  posthog.init(posthogApiKey, {
    api_host: posthogHost,
    person_profiles: 'identified_only', // or 'always'
    capture_pageview: false, // We'll handle this manually or via router
  });
} else if (!posthogApiKey) {
  console.warn('[PostHog] Missing VITE_POSTHOG_KEY');
}

export { posthog };
