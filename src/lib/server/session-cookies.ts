export const ACCESS_COOKIE = "marketplace-access";
export const REFRESH_COOKIE = "marketplace-refresh";
export const PERSISTENT_COOKIE = "marketplace-persistent";

export interface ApiSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
  tokenType: string;
}

export function sessionCookieOptions(persistent: boolean, maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(persistent && maxAge ? { maxAge } : {}),
  };
}
import type { NextResponse } from "next/server";

export function setSessionCookies(
  response: NextResponse,
  session: ApiSession,
  persistent: boolean,
) {
  response.cookies.set(
    ACCESS_COOKIE,
    session.accessToken,
    sessionCookieOptions(persistent, Math.max(1, session.expiresIn)),
  );
  response.cookies.set(
    REFRESH_COOKIE,
    session.refreshToken,
    sessionCookieOptions(persistent, 60 * 60 * 24 * 30),
  );
  response.cookies.set(
    PERSISTENT_COOKIE,
    persistent ? "true" : "false",
    sessionCookieOptions(persistent, 60 * 60 * 24 * 30),
  );
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, PERSISTENT_COOKIE]) {
    response.cookies.set(name, "", {
      ...sessionCookieOptions(false),
      maxAge: 0,
    });
  }
}
