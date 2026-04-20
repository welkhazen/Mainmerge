/**
 * Vercel edge function stub for POST /api/waitlist.
 * Until Supabase is wired (Phase 2), this accepts the payload, validates it,
 * and returns 202. Once SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set in
 * Vercel env, the commented block below will insert into waitlist_signups.
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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  let payload: WaitlistPayload;
  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!payload?.email || !isValidEmail(payload.email) || !isRole(payload.role)) {
    return new Response(JSON.stringify({ error: "invalid_payload" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/waitlist_signups`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        email: payload.email,
        role: payload.role,
        utm_source: payload.utm_source ?? null,
        utm_medium: payload.utm_medium ?? null,
        utm_campaign: payload.utm_campaign ?? null,
      }),
    });

    if (!insertResponse.ok) {
      return new Response(JSON.stringify({ error: "insert_failed" }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 202,
    headers: { "content-type": "application/json" },
  });
}
