# Marketplace Web

Next.js frontend for the Marketplace application. The project uses the App
Router, TypeScript, React, and Tailwind CSS.

## Stack

- Next.js 16
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- ESLint with the Next.js configuration

## Prerequisites

- Node.js 20.9 or newer
- npm
- The Marketplace API when working on API-backed features

## Local development

Install dependencies and start the development server:

```powershell
cd marketplace-web
npm ci
npm run dev
```

Open `http://localhost:3000`. Changes under `app/` are compiled and refreshed
automatically.

### Connect to the local API

Create `.env.local` in this directory:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`NEXT_PUBLIC_API_URL` is the intended browser-visible base URL for the Express
service. The starter page does not consume it yet. Only put non-secret values
in variables prefixed with `NEXT_PUBLIC_`, because Next.js includes them in the
browser bundle.

The API currently allows browser requests from exactly
`http://localhost:3000`. Use that hostname rather than `127.0.0.1` unless the
API CORS configuration is updated too.

## Run the complete local application

Use separate terminals so each long-running process remains visible.

Terminal 1 - local Supabase (needed once features use database/Auth services):

```powershell
cd marketplace-api
npm run supabase:start
```

Terminal 2 - Express API:

```powershell
cd marketplace-api
npm run dev
```

Terminal 3 - Next.js frontend:

```powershell
cd marketplace-web
npm run dev
```

Then verify the API at `http://localhost:4000/api/health` and open the web app
at `http://localhost:3000`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server on port `3000`. |
| `npm run lint` | Run ESLint across the package. |
| `npm run build` | Create an optimized production build. |
| `npm start` | Serve an existing production build on port `3000`. |

Run a production-mode check locally with:

```powershell
npm run lint
npm run build
npm start
```

`npm start` requires a successful `npm run build` first.

## Folder structure

```text
marketplace-web/
|-- app/
|   |-- favicon.ico            # Browser icon
|   |-- globals.css            # Tailwind import, theme variables, global styles
|   |-- layout.tsx             # Root HTML layout, fonts, and page metadata
|   `-- page.tsx               # Home route (`/`)
|-- public/                    # Static files served from the site root
|-- eslint.config.mjs          # ESLint configuration
|-- next.config.ts             # Next.js configuration
|-- postcss.config.mjs         # Tailwind/PostCSS integration
|-- tsconfig.json              # TypeScript and `@/*` path-alias settings
`-- package.json               # Dependencies and npm scripts
```

## Development conventions

- Files in `app/` are Server Components by default. Add `"use client"` only
  where browser state, effects, event handlers, or browser-only APIs are needed.
- Add a directory under `app/` to create a route; for example,
  `app/listings/page.tsx` becomes `/listings`.
- Place reusable UI in a top-level `components/` directory and shared API or
  utility code in `lib/` as those concerns are introduced.
- Import project modules with the configured `@/` alias rather than long
  relative paths.
- Put static assets in `public/` and reference them from `/`, such as
  `/logo.svg`.
- Keep secrets and server-only credentials out of `NEXT_PUBLIC_*` variables.

## Current development status

The home route and metadata are still the generated Next.js starter content.
No API client, application routes, tests, or authentication UI have been added
yet. When API integration begins, centralize the base URL and request/error
handling rather than repeating raw URLs across components.

## Related application

The Express/Supabase backend lives in the separate `marketplace-api` package.
Its README documents API environment variables, the health endpoint, and the
local Supabase workflow.
