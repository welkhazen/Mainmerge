/**
 * Vercel edge function stub for POST /api/waitlist.
 * Accepts the payload, validates it, and returns 202. Persistence is not
 * wired up — plug in your storage of choice where indicated.
 */

export const config = { runtime: "edge" };

type Role = "owner" | "provider" | "user";

interface WaitlistPayload {
  email: string;
  role: Role;
  owner_name?: string;
  community_name?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

function isRole(value: unknown): value is Role {
  return value === "owner" || value === "provider" || value === "user";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let payload: WaitlistPayload;
  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  if (!payload?.email || !isValidEmail(payload.email) || !isRole(payload.role)) {
    return jsonResponse({ error: "invalid_payload" }, 400);
  }

  return jsonResponse({ ok: true }, 202);
}
