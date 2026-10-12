# Maintenance audit and remaining work

## Completed

- Separated route entry points from application modules under `src/`.
- Removed an unreferenced demo listing form, unused demo products, and a tracked
  generated Playwright report.
- Removed an unused static university picker, its data, unused verification
  types, and an unused seller empty-state component after checking route reachability.
- Extracted the seller form hook, checkout model, and profile detail components.
- Replaced the first-100-products edit lookup with an owner-scoped product endpoint.
- Shared gateway/proxy upstream requests, timeouts, refresh, and cookie helpers.
- Added executable session/gateway regression tests and consistent check scripts.
- Added formatting, artifact ignores, contributor guidance, and CI validation.
- Applied compatible production dependency patches and updated Supabase image
  allowlists to match the local API's port 55321.

## Remaining work

The audit still reports five high-severity development-tool findings through
`eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces`.
The advisory is [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
The installed chain has no compatible patched release. npm's proposed forced
fix downgrades `eslint-config-next` to 14.2.35 while the app uses Next 16. Track an
upstream patch and retest lint/build when upgrading. Production dependencies
are checked separately with `npm.cmd run audit:production`.

Some interactive screens remain large. Extract cohesive subcomponents as their
behavior changes; avoid combining visual redesigns with structural refactors.
The current Node tests cover request/session behavior. Expand rendered browser
coverage for buyer checkout, seller listing edits/uploads, admin moderation,
messaging, and back-navigation session revalidation.

The current refactor preserves route contracts and application behavior. It
does not claim all features or hosted deployments are production-ready.
