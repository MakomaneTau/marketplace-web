const API_URL = "/api/marketplace";
const LEGACY_SESSION_KEY = "marketplace.session";

export const SELLER_DATA_EVENT = "marketplace-seller-data";
const AUTH_EVENT = "marketplace-auth";

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    role?: "buyer" | "seller";
    display_name?: string;
    [key: string]: unknown;
  };
}

export interface AuthProfile {
  role: "buyer" | "seller";
  displayName?: string;
  [key: string]: unknown;
}

export interface StoredAuth {
  user: AuthUser;
  profile?: AuthProfile;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const SESSION_ERROR_MESSAGE =
  "Your session has expired or you are not signed in. Please sign in to continue.";

let cachedAuth: StoredAuth | null | undefined;
let sessionRequest: Promise<StoredAuth | null> | null = null;
let sessionVersion = 0;

function emitAuthChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getStoredAuth(): StoredAuth | null {
  return cachedAuth ?? null;
}

export function clearLegacyBrowserSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
    window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
  } catch { /* Cookie sessions also work when browser storage is disabled. */ }
}

function setCachedAuth(auth: StoredAuth | null, notify = false) {
  cachedAuth = auth;
  if (notify) emitAuthChanged();
}

function invalidateSession() {
  sessionVersion += 1;
  sessionRequest = null;
  cachedAuth = undefined;
}

async function parse<T>(response: Response): Promise<T> {
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    throw new ApiClientError(
      response.status,
      error?.code || "REQUEST_FAILED",
      error?.message || "Request failed.",
      error?.details,
    );
  }
  return body?.data as T;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth: needsAuth = false, ...request } = init;
  const headers = new Headers(request.headers);

  if (request.body && !headers.has("Content-Type") && !(request.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (needsAuth) headers.set("x-marketplace-auth", "required");

  const response = await fetch(`${API_URL}${path}`, {
    ...request,
    headers,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 401 && needsAuth && path !== "/auth/me") {
    invalidateSession();
    setCachedAuth(null, true);
  }
  return parse<T>(response);
}

export const apiPublic = <T>(path: string, init?: RequestInit) => apiRequest<T>(path, init);

export async function getCurrentAuth(force = false): Promise<StoredAuth | null> {
  if (!force && cachedAuth !== undefined) return cachedAuth;
  if (sessionRequest) return sessionRequest;

  const version = sessionVersion;

  sessionRequest = apiRequest<StoredAuth>("/auth/me", { auth: true, signal: AbortSignal.timeout(15000) })
    .then((auth) => {
      if (version !== sessionVersion) return getCurrentAuth();
      setCachedAuth(auth, true);
      return auth;
    })
    .catch((error: unknown) => {
      if (version !== sessionVersion) return getCurrentAuth();
      if (error instanceof ApiClientError && error.status === 401) {
        setCachedAuth(null, true);
        return null;
      }
      throw error;
    })
    .finally(() => {
      if (version === sessionVersion) sessionRequest = null;
    });

  return sessionRequest;
}

export async function login(email: string, password: string, persistent: boolean) {
  const data = await apiRequest<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    headers: { "x-marketplace-persistent": persistent ? "true" : "false" },
    body: JSON.stringify({ email, password }),
  });
  invalidateSession();
  window.dispatchEvent(new Event("marketplace-auth-loading"));
  const auth = await getCurrentAuth();
  if (!auth) throw new ApiClientError(401, "AUTH_SESSION_MISSING", SESSION_ERROR_MESSAGE);
  return { ...data, ...auth };
}

export async function signup(input: Record<string, unknown>) {
  const data = await apiRequest<{ user: AuthUser; authenticated?: boolean; profile?: AuthProfile }>("/auth/signup", {
    method: "POST",
    headers: { "x-marketplace-persistent": "true" },
    body: JSON.stringify(input),
  });
  if (data.authenticated) {
    invalidateSession();
    window.dispatchEvent(new Event("marketplace-auth-loading"));
    const auth = await getCurrentAuth();
    if (!auth) throw new ApiClientError(401, "AUTH_SESSION_MISSING", SESSION_ERROR_MESSAGE);
    return { ...data, ...auth };
  }
  return data;
}

export async function resetPassword(password: string, recoveryAccessToken: string) {
  return apiRequest<void>("/auth/reset-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${recoveryAccessToken}` },
    body: JSON.stringify({ password }),
  });
}

export async function logout() {
  try {
    await apiRequest<void>("/auth/logout", { method: "POST", auth: true });
  } finally {
    invalidateSession();
    setCachedAuth(null, true);
  }
}

export function notifySellerDataChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SELLER_DATA_EVENT));
}

export function apiErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401 && error.code !== "AUTH_CREDENTIALS_INVALID") {
      return SESSION_ERROR_MESSAGE;
    }
    return error.message;
  }
  return "Unable to reach the marketplace service. Please try again.";
}
