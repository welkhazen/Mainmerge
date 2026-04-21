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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
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
        const upstreamText = await insertResponse.text().catch(() => "");
        console.error("waitlist_insert_failed", {
          upstream_status: insertResponse.status,
          upstream_body: upstreamText.slice(0, 500),
        });

        return jsonResponse(
          {
            error: "waitlist_unavailable",
            detail: "upstream_insert_failed",
          },
          503,
        );
      }
    } catch (error) {
      console.error("waitlist_insert_exception", error);
      return jsonResponse(
        {
          error: "waitlist_unavailable",
          detail: "upstream_request_failed",
        },
        503,
      );
    }
  }

  return jsonResponse({ ok: true }, 202);
}
