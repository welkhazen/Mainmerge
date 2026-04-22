export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// Mock responses for development mode
function getMockResponse(input: string): unknown {
  if (input.includes("/api/users/me")) {
    return {
      user: {
        id: "dev-user-1",
        username: "dev-user",
        displayName: "Development User",
        bio: "Testing UI/UX",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
        role: "member",
      },
    };
  }
  if (input.includes("/api/polls") || input.includes("/api/v2/polls")) {
    try {
      const raw = localStorage.getItem("raw.admin.polls.v1");
      const polls = raw ? (JSON.parse(raw) as unknown[]) : [];
      return { polls, votedPolls: [] };
    } catch {
      return { polls: [], votedPolls: [] };
    }
  }
  if (input.includes("/api/assistant")) {
    return { message: "" };
  }
  if (input.includes("/api/notifications")) {
    return { ok: true };
  }
  return { ok: true };
}

export async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
  // Development mode: use mock responses
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockResponse(input) as T);
      }, 100);
    });
  }

  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : "Request failed.";
    throw new ApiError(response.status, message);
  }

  return payload as T;
}
