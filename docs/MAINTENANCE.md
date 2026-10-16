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

## Deployment dependency maintenance

Node is bounded to `^22.13.0` so Vercel stays on Node 22 instead of automatically
selecting a future major version. CI also uses Node 22.

The five former development-tool advisories came from
`eslint-config-next -> @next/eslint-plugin-next -> fast-glob -> micromatch -> braces`
([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)).
There is no upstream braces patch yet. A version-scoped npm override replaces
only Next ESLint plugin 16.4.0's glob dependency with `tooling/next-root-glob`.
The adapter uses `tinyglobby@0.2.17` and disables automatic directory expansion
to preserve the plugin's `globSync` directory matching. Regression tests exercise
the real plugin's default root, literal directories, wildcard/brace patterns,
and arrays of roots. No Next rules are disabled or downgraded.

When updating `eslint-config-next`, inspect its glob dependency and root-discovery
API. Remove this adapter and override when the upstream dependency chain is clean;
otherwise review compatibility before extending the override to a new plugin version.
CI runs the full `npm run audit` so an upgrade cannot silently restore this chain.
Production dependencies can also be checked with `npm.cmd run audit:production`.

`allowScripts` explicitly approves only `unrs-resolver@1.12.2`. Its postinstall
prepares the resolver's matching native binding, using the installed optional
platform package or a registry fallback. Re-review and update the pinned approval
when the resolver changes; never blanket-approve all future dependency scripts.
On npm versions that support approval management, use `npm install-scripts ls`
to inspect pending approvals.

## Remaining work

Some interactive screens remain large. Extract cohesive subcomponents as their
behavior changes; avoid combining visual redesigns with structural refactors.
The current Node tests cover request/session behavior. Expand rendered browser
coverage for buyer checkout, seller listing edits/uploads, admin moderation,
messaging, and back-navigation session revalidation.

The current refactor preserves route contracts and application behavior. It
does not claim all features or hosted deployments are production-ready.
