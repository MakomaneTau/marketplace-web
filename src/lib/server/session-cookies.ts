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
