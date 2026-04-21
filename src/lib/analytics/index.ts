import { useCallback } from "react";
import { usePostHog } from "posthog-js/react";
import type { EventName, EventPropsFor } from "./events";
import { getClient } from "./client";

const isTestMode = import.meta.env.MODE === "test";
const isDevMode = import.meta.env.DEV === true;

/**
 * Fire a typed event. Property shape is enforced at compile time by the
 * discriminated union in `events.ts`. No-ops in test mode.
 */
export function track<E extends EventName>(
  name: E,
  properties: EventPropsFor<E>,
): void {
  captureWithGuards(name, properties as Record<string, unknown>);
}

/**
 * Escape hatch for one-off diagnostics/prototyping events that are not yet in
 * `events.ts`. Prefer `track()` for production analytics.
 */
export function trackCustom(
  name: string,
  properties: Record<string, unknown> = {},
): void {
  captureWithGuards(name, properties);
}

function captureWithGuards(
  name: string,
  properties: Record<string, unknown>,
): void {
  if (isTestMode) {
    return;
  }

  if (isDevMode) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${name}`, properties);
  }

  const client = getClient();
  if (!client) {
    return;
  }

  client.capture(name, properties);
}

/**
 * Identify the current user. Also alias the anonymous id so pre-signup events
 * stitch to the user.
 */
export function identify(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  if (isTestMode) {
    return;
  }

  const client = getClient();
  if (!client) {
    return;
  }

  try {
    const anonId = client.get_distinct_id?.();
    client.identify(userId, traits);
    if (anonId && anonId !== userId) {
      client.alias(userId, anonId);
    }
  } catch {
    // identify failures shouldn't break the app
  }
}

/**
 * Clear the current identity (logout).
 */
export function reset(): void {
  if (isTestMode) {
    return;
  }

  const client = getClient();
  client?.reset();
}

/**
 * Attach the user to a group. Useful for per-community cohorts later.
 */
export function group(
  groupType: string,
  groupKey: string,
  traits?: Record<string, unknown>,
): void {
  if (isTestMode) {
    return;
  }

  const client = getClient();
  client?.group(groupType, groupKey, traits);
}

/**
 * Register super-properties sent with every subsequent event.
 */
export function registerSuperProps(props: Record<string, unknown>): void {
  if (isTestMode) {
    return;
  }

  const client = getClient();
  client?.register(props);
}

/**
 * React hook that returns a stable `track` bound to the live PostHog client.
 * Prefer this inside components so the binding updates if the client swaps.
 */
export function useTrack(): <E extends EventName>(
  name: E,
  properties: EventPropsFor<E>,
) => void {
  const ph = usePostHog();

  return useCallback(
    <E extends EventName>(name: E, properties: EventPropsFor<E>) => {
      if (isTestMode) {
        return;
      }

      if (isDevMode) {
        // eslint-disable-next-line no-console
        console.log(`[analytics] ${name}`, properties);
      }

      if (!ph) {
        return;
      }

      ph.capture(name, properties as Record<string, unknown>);
    },
    [ph],
  );
}

export type { AppEvent, EventName, EventPropsFor } from "./events";
