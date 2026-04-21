import posthog from 'posthog-js';

export function initPostHog() {
  posthog.init('phc_C6VjShPz9cMttT9XWJeXAnPTf8wGJDTgkzd3hchT98KA', {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2026-01-30',
  });
}

export default posthog;
