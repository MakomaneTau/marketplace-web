import { randomBytes } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";

import { isPublicBuyerPage, roleRedirect } from "@/lib/role-access";
import { contentSecurityPolicy } from "@/lib/server/security-policy";
import { refreshSession, upstreamRequest } from "@/lib/server/marketplace";
import {
  ACCESS_COOKIE,
  PERSISTENT_COOKIE,
  REFRESH_COOKIE,
  type ApiSession,
  setSessionCookies,
  clearSessionCookies,
} from "@/lib/server/session-cookies";

type CurrentUserPayload = {
  data?: { profile?: { role?: string; isAdmin?: boolean } };
};

async function currentUser(accessToken: string) {
  return upstreamRequest("auth/me", {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

function loginRedirect(request: NextRequest, expired = false) {
  const url = new URL("/login", request.url);
  url.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  if (expired) url.searchParams.set("reason", "session_expired");
  const response = NextResponse.redirect(url);
  clearSessionCookies(response);
  return response;
}

function accessErrorRedirect(
  request: NextRequest,
  reason:
    | "seller_required"
    | "admin_required"
    | "account_suspended"
    | "auth_unavailable",
) {
  const url = new URL("/access-denied", request.url);
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

async function authorizePage(request: NextRequest, requestHeaders: Headers) {
  const publicPage = isPublicBuyerPage(request.nextUrl.pathname);
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
  if (!accessToken) {
    if (publicPage) {
      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });
      response.headers.set("Cache-Control", "private, no-store");
      if (refreshToken) clearSessionCookies(response);
      return response;
    }
    return loginRedirect(request, Boolean(refreshToken));
  }

  let authResponse: Response;
  try {
    authResponse = await currentUser(accessToken);
    if (authResponse.status === 401 && refreshToken && !refreshedSession) {
      refreshedSession = await refreshSession(refreshToken);
      if (refreshedSession)
        authResponse = await currentUser(refreshedSession.accessToken);
    }
  } catch {
    return accessErrorRedirect(request, "auth_unavailable");
  }

  if (authResponse.status === 401) return loginRedirect(request, true);
  if (authResponse.status === 403) {
    const blocked = (await authResponse
      .clone()
      .json()
      .catch(() => null)) as { error?: { code?: string } } | null;
    if (blocked?.error?.code === "ACCOUNT_SUSPENDED")
      return accessErrorRedirect(request, "account_suspended");
  }
  if (!authResponse.ok) return accessErrorRedirect(request, "auth_unavailable");

  const payload = (await authResponse
    .json()
    .catch(() => null)) as CurrentUserPayload | null;
  if (
    request.nextUrl.pathname.startsWith("/seller") &&
    payload?.data?.profile?.role !== "seller"
  ) {
    return accessErrorRedirect(request, "seller_required");
  }
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    payload?.data?.profile?.isAdmin !== true
  ) {
    return accessErrorRedirect(request, "admin_required");
  }

  const destination = roleRedirect(
    payload?.data?.profile,
    request.nextUrl.pathname,
  );
  const response = destination
    ? NextResponse.redirect(new URL(destination, request.url))
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  if (refreshedSession) {
    const persistent = request.cookies.get(PERSISTENT_COOKIE)?.value === "true";
    setSessionCookies(response, refreshedSession, persistent);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = randomBytes(18).toString("base64");
  const policy = contentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "production",
  );
  const requestHeaders = new Headers(request.headers);
  // Always overwrite caller-supplied values before Next renders script tags.
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  const path = request.nextUrl.pathname;
  const guarded =
    path === "/" ||
    [
      "search",
      "categories",
      "products",
      "cart",
      "seller",
      "admin",
      "favourites",
      "messages",
      "orders",
      "profile",
    ].some(
      (segment) => path === `/${segment}` || path.startsWith(`/${segment}/`),
    );
  const response = guarded
    ? await authorizePage(request, requestHeaders)
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set(
    "Cache-Control",
    "private, no-store, max-age=0, must-revalidate",
  );
  return response;
}

export const config = {
  matcher: ["/((?!api/|api$|_next/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
