import type { NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/server/session-cookies";

export class RequestSecurityError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function originIsAllowed(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site" || site === "same-site") return false;
  const expected = process.env.APP_ORIGIN || request.nextUrl.origin;
  const origin = request.headers.get("origin");
  try {
    if (origin) return origin === new URL(expected).origin;
    const referer = request.headers.get("referer");
    if (referer) return new URL(referer).origin === new URL(expected).origin;
  } catch {
    return false;
  }
  if (site === "same-origin") return true;
  // Non-browser token clients do not rely on ambient session cookies.
  return (
    /^Bearer\s+\S+$/i.test(request.headers.get("authorization") || "") &&
    !request.cookies.has(ACCESS_COOKIE) &&
    !request.cookies.has(REFRESH_COOKIE)
  );
}

export function validatedGatewayPath(segments: string[]) {
  if (
    !segments.length ||
    segments.some(
      (part) =>
        !part ||
        part === "." ||
        part === ".." ||
        /[\\/\x00-\x1f\x7f%]/.test(part),
    )
  ) {
    throw new RequestSecurityError(
      400,
      "INVALID_API_PATH",
      "The API path is invalid.",
    );
  }
  return segments.map(encodeURIComponent).join("/");
}

export async function boundedRequestBody(request: NextRequest, path: string) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return undefined;
  const encoding = request.headers.get("content-encoding");
  if (encoding && encoding.toLowerCase() !== "identity")
    throw new RequestSecurityError(
      415,
      "CONTENT_ENCODING_UNSUPPORTED",
      "Compressed request bodies are not supported.",
    );
  const multipart = request.headers
    .get("content-type")
    ?.toLowerCase()
    .startsWith("multipart/form-data;");
  // Verification accepts two 5 MB images; other uploads accept one, plus MIME overhead.
  const limit = multipart
    ? (path === "verifications/seller" ? 11 : 6) * 1024 * 1024
    : 1024 * 1024;
  const tooLarge = () =>
    new RequestSecurityError(
      413,
      "REQUEST_TOO_LARGE",
      "The request body exceeds the allowed size.",
    );
  const length = request.headers.get("content-length");
  if (
    length !== null &&
    (!/^\d+$/.test(length) || !Number.isSafeInteger(Number(length)))
  )
    throw new RequestSecurityError(
      400,
      "INVALID_CONTENT_LENGTH",
      "The request size is invalid.",
    );
  if (length !== null && Number(length) > limit) throw tooLarge();
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    void reader.cancel().catch(() => {});
  }, 15_000);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (timedOut)
        throw new RequestSecurityError(
          408,
          "REQUEST_TIMEOUT",
          "The request body took too long to arrive.",
        );
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        void reader.cancel().catch(() => {});
        throw tooLarge();
      }
      chunks.push(value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return body.buffer;
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }
}
