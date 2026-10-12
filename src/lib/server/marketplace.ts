import { type ApiSession } from "@/lib/server/session-cookies";

// Keep upstream configuration and refresh behavior identical in the route
// gateway and the protected-page proxy. This module belongs on the server.
const upstreamApiUrl = (
  process.env.MARKETPLACE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:4000"
).replace(/\/$/, "");

export function upstreamRequest(path: string, init: RequestInit = {}) {
  return fetch(`${upstreamApiUrl}/api/v1/${path}`, {
    ...init,
    cache: "no-store",
    redirect: "manual",
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
}

export async function refreshSession(
  refreshToken: string,
): Promise<ApiSession | null> {
  const response = await upstreamRequest("auth/refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return null;
  const payload = (await response.json().catch(() => null)) as {
    data?: { session?: ApiSession | null };
  } | null;
  return payload?.data?.session ?? null;
}
