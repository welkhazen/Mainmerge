import { env } from "../../config/env";

export class SupabaseRestRepository {
  protected readonly baseUrl: string;
  protected readonly serviceRoleKey: string;
  protected readonly schema: string;

  constructor() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }

    this.baseUrl = env.SUPABASE_URL;
    this.serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
    this.schema = env.SUPABASE_SCHEMA;
  }

  protected async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    table: string,
    query: string,
    body?: Record<string, unknown> | Array<Record<string, unknown>>
  ): Promise<T> {
    const queryPrefix = query.length > 0 ? `?${query}` : "";
    const url = `${this.baseUrl}/rest/v1/${table}${queryPrefix}`;

    const response = await fetch(url, {
      method,
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "Accept-Profile": this.schema,
        "Content-Profile": this.schema,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Supabase ${method} ${table} failed (${response.status}): ${details}`);
    }

    if (response.status === 204) {
      return [] as T;
    }

    return (await response.json()) as T;
  }
}
