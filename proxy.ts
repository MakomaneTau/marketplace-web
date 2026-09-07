import { type NextRequest, NextResponse } from "next/server";

import {
  ACCESS_COOKIE,
  PERSISTENT_COOKIE,
  REFRESH_COOKIE,
  type ApiSession,
  sessionCookieOptions,
} from "@/app/libs/session-cookies";

const UPSTREAM_API_URL = (
  process.env.MARKETPLACE_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:4000"
).replace(/\/$/, "");

type CurrentUserPayload = { data?: { profile?: { role?: string } } };
type RefreshPayload = { data?: { session?: ApiSession | null } };

async function currentUser(accessToken: string) {
  return fetch(`${UPSTREAM_API_URL}/api/v1/auth/me`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

async function refreshSession(refreshToken: string) {
  const response = await fetch(`${UPSTREAM_API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json().catch(() => null)) as RefreshPayload | null;
  return payload?.data?.session || null;
}

function loginRedirect(request: NextRequest, expired = false) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (expired) url.searchParams.set("reason", "session_expired");
  const response = NextResponse.redirect(url);
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, PERSISTENT_COOKIE]) {
    response.cookies.set(name, "", { ...sessionCookieOptions(false), maxAge: 0 });
  }
  return response;
}

function accessErrorRedirect(request: NextRequest, reason: "seller_required" | "auth_unavailable") {
  const url = new URL("/access-denied", request.url);
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  let refreshedSession: ApiSession | null = null;

  if (!accessToken && refreshToken) {
    try {
      refreshedSession = await refreshSession(refreshToken);
      accessToken = refreshedSession?.accessToken;
    } catch {
      return accessErrorRedirect(request, "auth_unavailable");
    }
  }
  if (!accessToken) return loginRedirect(request, Boolean(refreshToken));

  let authResponse: Response;
  try {
    authResponse = await currentUser(accessToken);
    if (authResponse.status === 401 && refreshToken && !refreshedSession) {
      refreshedSession = await refreshSession(refreshToken);
      if (refreshedSession) authResponse = await currentUser(refreshedSession.accessToken);
    }
  } catch {
    return accessErrorRedirect(request, "auth_unavailable");
  }

  if (authResponse.status === 401) return loginRedirect(request, true);
  if (!authResponse.ok) return accessErrorRedirect(request, "auth_unavailable");

  const payload = (await authResponse.json().catch(() => null)) as CurrentUserPayload | null;
  if (request.nextUrl.pathname.startsWith("/seller") && payload?.data?.profile?.role !== "seller") {
    return accessErrorRedirect(request, "seller_required");
  }

  const response = NextResponse.next();
  if (refreshedSession) {
    const persistent = request.cookies.get(PERSISTENT_COOKIE)?.value === "true";
    response.cookies.set(
      ACCESS_COOKIE,
      refreshedSession.accessToken,
      sessionCookieOptions(persistent, Math.max(1, refreshedSession.expiresIn)),
    );
    response.cookies.set(
      REFRESH_COOKIE,
      refreshedSession.refreshToken,
      sessionCookieOptions(persistent, 60 * 60 * 24 * 30),
    );
  }
  return response;
}

export const config = {
  matcher: [
    "/seller/:path*",
    "/favourites/:path*",
    "/messages/:path*",
    "/orders/:path*",
    "/profile/:path*",
  ],
};
