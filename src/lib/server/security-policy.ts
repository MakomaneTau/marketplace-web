export function contentSecurityPolicy(nonce: string, production: boolean) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${production ? "" : " 'unsafe-eval'"}`,
    "script-src-attr 'none'",
    // React uses inline style attributes for layout and progress indicators.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co${production ? "" : " http://127.0.0.1:55321 http://localhost:55321"}`,
    "font-src 'self' data:",
    `connect-src 'self'${production ? "" : " ws://localhost:* ws://127.0.0.1:*"}`,
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
