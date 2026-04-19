'use client';

import { ReactNode, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PostHogProviderBase } from 'posthog-js/react';

const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

if (typeof window !== 'undefined' && posthogKey && !posthog.__loaded) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-05-24',
    capture_exceptions: true,
    debug: import.meta.env.MODE === 'development',
  });
}

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    if (!posthogKey) {
      console.warn(
        'Warning: VITE_PUBLIC_POSTHOG_KEY is not set. PostHog analytics will not be sent. Please add it to your .env.local file.'
      );
    }
  }, []);

  return <PostHogProviderBase client={posthog}>{children}</PostHogProviderBase>;
}
