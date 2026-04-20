import { track } from "@/lib/analytics";

/**
 * Thin fetch wrapper that reports api_error for non-2xx responses and network
 * failures. Returns the underlying Response so callers can read it normally.
 * Throws only for network failures (same as fetch).
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const startedAt = performance.now();
  const endpoint = typeof input === "string" ? input : input.toString();

  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      track("api_error", {
        endpoint,
        status: response.status,
        latency_ms: Math.round(performance.now() - startedAt),
      });
    }
    return response;
  } catch (error) {
    track("api_error", {
      endpoint,
      status: 0,
      latency_ms: Math.round(performance.now() - startedAt),
    });
    throw error;
  }
}
