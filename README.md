# Command Connect

Command Connect is a React monorepo for a public website and admin panel deployed on Vercel, with Supabase as the backend.

- `apps/public-site`: public-facing SPA on Vercel root
- `apps/admin`: admin SPA on Vercel `/admin/`
- `packages/shared`: shared Supabase helpers, tenant utilities, and TS models

## Deployment Target

- Frontend: Vercel
- Backend: Supabase
- Primary domain: `https://infopers.web.id/`
- Admin panel: `https://infopers.web.id/admin/`

## Quick Start

```bash
npm install
npm run dev
```

Public site: http://localhost:4173
Admin panel: http://localhost:4174

## Available Commands

- `npm run dev` — start public site locally
- `npm run dev:admin` — start admin app locally
- `npm run build` — build both apps and prepare Vercel output
- `npm run build:public` — build public site
- `npm run build:admin` — build admin app
- `npm run preview` — preview public build
- `npm run preview:admin` — preview admin build
- `npm run lint` — lint root workspace
- `npm run test` — run Vitest tests
- `npm run type-check` — run TypeScript checks

## Project Structure

```
command-connect/
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI validation before Vercel deploy
├── apps/
│   ├── public-site/               # Public SPA source
│   └── admin/                     # Admin SPA source
├── packages/
│   └── shared/                    # Shared Supabase helpers and types
├── scripts/
│   └── build-vercel-output.js     # Prepare Vercel output
├── vercel.json                    # Vercel hosting configuration
├── package.json                   # Monorepo scripts and dependencies
└── tsconfig.json                  # Root TypeScript config
```

## Environment Variables

### Development

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:4173
VITE_ADMIN_APP_URL=http://localhost:4174
VITE_TENANT_ROOT_DOMAINS=localhost
```

### Production (Vercel)

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_URL=https://infopers.web.id
VITE_TENANT_ROOT_DOMAINS=infopers.web.id
```

## Deployment

1. Build from repo root:

```bash
npm run build
```

2. Deploy using Vercel from the repository root.
3. Primary site is available at `https://infopers.web.id/`.
4. Admin panel is available at `https://infopers.web.id/admin/`.

## CI / Verification

- `.github/workflows/ci.yml` runs on `push` and `pull_request` to `main`
- Jobs: `typecheck`, `lint`, `test`, `build-public-site`, `build-admin`
- Vercel deployment should only proceed after all checks pass

## Notes

- Legacy Cloudflare and GitHub Pages workflows have been removed.
- Frontend deployment is now Vercel-only.
- Backend data and auth are handled by Supabase.

