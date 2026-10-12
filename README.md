# Marketplace Web

Next.js 16 App Router frontend for the student marketplace, using React 19,
strict TypeScript, and Tailwind CSS 4. Public catalogue pages, buyer accounts,
checkout/orders, favourites, messaging, seller operations, verification, and
admin moderation connect to the separate `marketplace-api` repository.

## Local setup

Prerequisites: Node.js 22.13 or newer and npm. Run from this repository:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local  # first setup only
npm.cmd run dev
```

Open `http://localhost:3000`. API-backed features require the API at port 4000
and its Supabase stack. In the API repository, run `npm.cmd run supabase:start`
and either `npm.cmd run dev` or `docker compose up --build -d`.

Configure the server-only upstream in `.env.local`:

```dotenv
MARKETPLACE_API_URL=http://127.0.0.1:4000
```

The deprecated `NEXT_PUBLIC_API_URL` fallback remains for existing environments.
Browser requests always use the same-origin `/api/marketplace/*` gateway.
Sessions stay in HttpOnly cookies. Never put privileged keys or secrets in
`NEXT_PUBLIC_*` values.

Local Supabase Storage/Studio use ports 55321/55323. Image allowlists in
`next.config.ts` match the API's local port. Restart Next after changing server
environment variables or Next configuration.

## Structure

```text
app/                     Routes, layouts, metadata, error/loading boundaries
  (public)/              Catalogue and information pages
  (auth)/                Login, signup, recovery, and verification
  (marketplace)/         Protected buyer/account routes
  (seller)/              Seller routes and legacy product route aliases
  (admin)/               Admin routes
  api/marketplace/       Same-origin Express gateway
src/
  components/<feature>/  UI, feature hooks, local types, and screen models
  hooks/                 Shared hooks
  lib/                   API/session client, formatting, catalogue mapping, utilities
    server/              Upstream requests and session refresh
  types/                 Shared application types
  data/                  Deliberate metadata/fallbacks
  styles/                Design tokens imported by app/globals.css
public/                  Served static assets
tests/                   Node regression tests for sessions, gateway, and models
proxy.ts                 Protected-page session and role guards
```

The `@/` alias resolves to `src/`. Keep route entries small, colocate related
feature code, and keep browser/server dependencies separate. See
[CONTRIBUTING.md](CONTRIBUTING.md) for ownership boundaries and change guidance.

## Quality checks

```powershell
npm.cmd run format       # apply formatting
npm.cmd run lint:fix     # apply safe lint fixes
npm.cmd run check        # formatting, zero-warning lint, route types/TypeScript, tests
npm.cmd run build        # optimized production build
npm.cmd run audit:production
```

Serve a successful production build with `npm.cmd start`. CI runs the check
suite and production build on pushes and pull requests. Tests use controlled
fetch responses; visual and click-level verification still require a browser.

[docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) describes connected flows and
manual acceptance. [docs/MAINTENANCE.md](docs/MAINTENANCE.md) records remaining
work and unresolved development-tool advisories. Generated build output,
Playwright reports, logs, and local environment files stay out of Git.
