import { type NextRequest, NextResponse } from "next/server";

import { refreshSession, upstreamRequest } from "@/lib/server/marketplace";
import {
  boundedRequestBody,
  originIsAllowed,
  RequestSecurityError,
  validatedGatewayPath,
} from "@/lib/server/request-security";
import {
  ACCESS_COOKIE,
  PERSISTENT_COOKIE,
  REFRESH_COOKIE,
  type ApiSession,
  setSessionCookies,
  clearSessionCookies,
} from "@/lib/server/session-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };
type AuthPayload = {
  data?: {
    session?: ApiSession | null;
    user?: unknown;
    authenticated?: boolean;
  };
};

function isUnsafeMethod(method: string) {
  return !new Set(["GET", "HEAD", "OPTIONS"]).has(method);
}

function upstreamHeaders(request: NextRequest, accessToken?: string) {
  const headers = new Headers();
  for (const name of ["accept", "content-type", "x-request-id"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const explicitAuthorization = request.headers.get("authorization");
  if (explicitAuthorization)
    headers.set("authorization", explicitAuthorization);
  else if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  return headers;
}

async function callUpstream(
  request: NextRequest,
  path: string,
  body: ArrayBuffer | undefined,
  accessToken?: string,
) {
  return upstreamRequest(`${path}${request.nextUrl.search}`, {
    method: request.method,
    headers: upstreamHeaders(request, accessToken),
    body,
    cache: "no-store",
    redirect: "manual",
  });
}

async function toNextResponse(upstream: Response, path: string) {
  const bytes = await upstream.arrayBuffer();
  const headers = new Headers();
  for (const name of [
    "content-type",
    "retry-after",
    "ratelimit-remaining",
    "ratelimit-reset",
    "x-request-id",
  ]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  let responseBody: BodyInit | null = bytes.byteLength ? bytes : null;
  if (
    (path === "auth/login" ||
      path === "auth/signup" ||
      path === "auth/mfa/verify") &&
    upstream.ok &&
    bytes.byteLength
  ) {
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as AuthPayload;
    if (payload.data) {
      payload.data = {
        user: payload.data.user,
        ...(path === "auth/signup"
          ? { authenticated: Boolean(payload.data.session) }
          : {}),
      };
      responseBody = JSON.stringify(payload);
      headers.set("content-type", "application/json");
    }
  }

  return new NextResponse(responseBody, { status: upstream.status, headers });
}

async function handle(request: NextRequest, context: RouteContext) {
  if (isUnsafeMethod(request.method) && !originIsAllowed(request)) {
    return NextResponse.json(
      {
        error: {
          code: "ORIGIN_NOT_ALLOWED",
          message: "The request origin is not allowed.",
        },
      },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const { path: segments } = await context.params;
  const path = validatedGatewayPath(segments);
  const body = await boundedRequestBody(request, path);
  const explicitAuthorization = request.headers.has("authorization");
  const needsAuth = request.headers.get("x-marketplace-auth") === "required";
  const persistentHeader = request.headers.get("x-marketplace-persistent");
  const persistent = persistentHeader
    ? persistentHeader === "true"
    : request.cookies.get(PERSISTENT_COOKIE)?.value === "true";
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let refreshedSession: ApiSession | null = null;

  if (needsAuth && !explicitAuthorization && !accessToken && refreshToken) {
    refreshedSession = await refreshSession(refreshToken);
    accessToken = refreshedSession?.accessToken;
  }

  let upstream = await callUpstream(request, path, body, accessToken);
  if (
    upstream.status === 401 &&
    needsAuth &&
    !explicitAuthorization &&
    refreshToken &&
    !refreshedSession
  ) {
    refreshedSession = await refreshSession(refreshToken);
    if (refreshedSession) {
      upstream = await callUpstream(
        request,
        path,
        body,
        refreshedSession.accessToken,
      );
    }
  }

  const authPayload =
    (path === "auth/login" ||
      path === "auth/signup" ||
      path === "auth/mfa/verify") &&
    upstream.ok
      ? ((await upstream
          .clone()
          .json()
          .catch(() => null)) as AuthPayload | null)
      : null;
  const response = await toNextResponse(upstream, path);
  response.headers.set("Cache-Control", "private, no-store");

  if (authPayload?.data?.session) {
    setSessionCookies(response, authPayload.data.session, persistent);
  } else if (refreshedSession) {
    setSessionCookies(response, refreshedSession, persistent);
  }
  if (
    path === "auth/logout" ||
    (needsAuth && upstream.status === 401 && !refreshedSession)
  ) {
    clearSessionCookies(response);
  }
  return response;
}

async function safeHandle(request: NextRequest, context: RouteContext) {
  try {
    return await handle(request, context);
  } catch (error) {
    if (error instanceof RequestSecurityError)
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        {
          status: error.status,
          headers: { "Cache-Control": "private, no-store" },
        },
      );
    return NextResponse.json(
      {
        error: {
          code: "MARKETPLACE_SERVICE_UNAVAILABLE",
          message: "The marketplace service is temporarily unavailable.",
        },
      },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

export const GET = safeHandle;
export const POST = safeHandle;
export const PUT = safeHandle;
export const PATCH = safeHandle;
export const DELETE = safeHandle;
