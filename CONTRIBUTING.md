# Maintaining Marketplace Web

Use Node.js 22.x (22.13 or newer). Install with `npm.cmd ci`, run `npm.cmd run check`,
and run `npm.cmd run build` before a pull request. Both repositories have
independent lockfiles and CI workflows.

## Code boundaries

- `app/` contains Next.js routes, layouts, metadata, and error/loading boundaries.
  Large interactive screens live under `src/components/<feature>/`.
- `src/components/` groups shared UI by feature. Keep its hooks, local types,
  and pure models beside the components they support.
- `src/hooks/` contains hooks shared across features.
- `src/lib/` contains the browser API/session client and shared pure utilities.
- `src/lib/server/` contains upstream API access used only by the route gateway
  and protected-page proxy.
- `src/types/` contains shared types; `src/data/` contains deliberate catalogue
  metadata/fallbacks, not replacement database identities.
- `src/styles/` owns design tokens. `app/globals.css` imports those tokens and
  global rules; `public/` contains served static assets.

The `@/` alias resolves to `src/`. Prefer feature-local imports for closely
related files and the alias for shared modules. Do not add an empty services or
repositories folder in anticipation of future code. Extract logic when a
module acquires a separate responsibility, not just to meet a line count.

## Routes and sessions

Browser API requests use `src/lib/api.ts` and the same-origin
`/api/marketplace/*` gateway. Keep service keys and bearer sessions out of client
storage. Cookie settings live in `src/lib/server/session-cookies.ts`; upstream access
and refresh logic live in `src/lib/server/marketplace.ts`. Preserve role guards,
no-store responses, session expiry behavior, and the legacy-session cleanup.

Existing public URLs must keep working when moving source files. The
misspelled `/verifcation` route remains a compatibility entry; canonical
verification lives at `/signup/verification`. Do not make one route's page
implementation depend on another route's page file.

## UI and tests

Preserve loading, empty, failure, and signed-out states. Match the existing
design tokens and accessible labels. Keep data requests and mutation logic in
feature hooks/models when they make a screen difficult to read. Cancel obsolete
requests when changing effects; clean up timers, subscriptions, and object URLs.

Node tests cover the session client, gateway, and pure models using controlled
fetch implementations. They do not prove browser layout or interaction. For UI
changes, check the rendered buyer, seller, and admin paths on desktop and mobile.
Generated Playwright reports, build output, and local credentials stay ignored.

## Quality and dependencies

Formatting uses a [pinned Prettier version](https://prettier.io/docs/install).
Run `npm.cmd run format` and `npm.cmd run lint:fix` before `npm.cmd run check`.
Lint permits zero warnings, and type checking generates current Next route types
before invoking TypeScript. CI also runs a production build.

Review dependency updates with their lockfile changes and test them before
merging. Track unresolved advisories with their dependency path and available
fix; do not blindly force an incompatible framework downgrade.
