# Web security controls

Implemented on 18 October 2026:

- Every rendered page receives a fresh CSP nonce. Production scripts must carry that nonce; inline event handlers and arbitrary inline scripts are blocked. The nonce and CSP forwarded to Next overwrite caller-supplied headers.
- Root rendering waits for the request so static HTML cannot reuse a nonce. Page responses are private/non-cacheable. This trades static-page caching for a strict script policy; measure production latency and capacity accordingly.
- Framing is denied; MIME sniffing and framework disclosure are disabled. Production responses set HSTS. Inline styles remain allowed because components use React style attributes; the script policy does not allow `unsafe-inline` or production `unsafe-eval`.
- Cookie-authenticated mutations require a matching Origin/Referer or same-origin Fetch Metadata. Cross-site, sibling-site and opaque-origin requests are rejected. Standalone bearer-token clients can omit browser metadata only when they carry no session cookies.
- Gateway bodies are counted while streaming: 1 MB for ordinary requests, 6 MB for a single-image multipart request, and 11 MB for two-image verification. Declared size does not bypass actual-byte checks. Body reads have a 15-second deadline and compressed requests are rejected.
- Traversal and encoded path separators cannot escape the API gateway's versioned path. Authentication/session cookies remain HttpOnly, Secure in production, and SameSite=Lax.
- A scheduled production dependency audit runs on Mondays and on pushes/PRs after this workflow is pushed.
- Admin tools are gated by authenticator setup and verification. The API enforces the same requirement for moderation reads and writes. The MFA exchange rotates HttpOnly session cookies and removes access/refresh tokens from browser JSON. Setup secrets remain only in component memory and are cleared after verification.

## Deployment

Set `APP_ORIGIN` to the exact public web origin, such as `https://market.example`, especially behind a reverse proxy. Use a separate correct value for each preview environment. `MARKETPLACE_API_URL` is server-only and should point at the intended API over TLS or a protected internal network. Never put privileged Supabase keys in `NEXT_PUBLIC_*` values.

Confirmed production origin: `https://marketplace-web-pearl.vercel.app` (Vercel `just-me-04e2/marketplace-web`). Set `APP_ORIGIN` to this exact origin for that deployment. Its current public script policy is still the older policy; these application changes have not been deployed because the connected Vercel credentials cannot access the team's project settings (403).

Deploy the companion API controls together with this web flow; see `../marketplace-api/SECURITY.md` for applied hosted database migrations and recovery steps. The shared production counter backend is installed, but its application integration and admin MFA enforcement await release. Hosting WAF rules, hosted authentication settings, monitoring and backups still require configuration and verification.

From this package in PowerShell:

```powershell
node --test tests/security.test.mjs tests/gateway.test.mjs tests/auth-session.test.mjs
npm.cmd run typecheck
npm.cmd run build
npm.cmd run audit:production
```

Verify real production HTML has a fresh CSP nonce matching every executable script, and verify login, sign-out, uploads, and protected routes in a browser after deployment. The full existing web suite also contains a separately failing Windows lint-root discovery test; it is unrelated to the security regression tests.

Reference: [Next.js nonce-based CSP](https://nextjs.org/docs/app/guides/content-security-policy).
