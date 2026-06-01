# Command Connect

A multi-tenant public site and admin panel built with React, Vite, Supabase, and TanStack.

This repository contains the full application stack for a tenant-aware CMS-style site, including:

- `apps/public-site`: the public-facing website with SSR, search, RSS, and sitemap generation.
- `apps/admin`: the admin dashboard for managing news, events, officers, gallery items, press kits, and contact messages.
- `packages/shared`: shared Supabase helpers, tenant detection, and TypeScript models.

> This repository is currently structured as a monorepo. Use the root `package.json` scripts to run the public site and admin app together.

## Key Features

- Tenant-aware Supabase access using `tenant_id` filters
- Wildcard subdomain tenant detection
- Supabase auth for the admin panel
- Shared data models for public and admin code
- Client and server-side rendering for the public site
- RSS and sitemap support for published news

## Repository Structure

- `apps/public-site/`
  - Public website source code
  - Vite-based client and SSR entry
  - `server.ts` handles RSS and sitemap generation
- `apps/admin/`
  - Admin SPA with login and content management
  - Uses shared Supabase helpers and tenant-aware access
- `packages/shared/`
  - Shared utilities and data access helpers
  - `supabase.ts` centralizes Supabase client setup and queries
  - `tenant.ts` resolves tenant slugs from hostname
  - `types.ts` defines shared TypeScript models

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy example environment files:

```bash
cp apps/public-site/.env.example apps/public-site/.env
cp apps/admin/.env.example apps/admin/.env
```

3. Update the copied `.env` files with your Supabase credentials.

4. Start the public site locally:

```bash
npm run dev
```

5. Start the admin app locally in another terminal:

```bash
npm run dev:admin
```

## Common Scripts

- `npm run dev` — run `apps/public-site` locally
- `npm run dev:admin` — run `apps/admin` locally
- `npm run build` — build `apps/public-site`
- `npm run build:admin` — build `apps/admin`
- `npm run preview` — preview `apps/public-site`
- `npm run preview:admin` — preview `apps/admin`
- `npm run lint` — lint `apps/public-site`
- `npm run lint:admin` — lint `apps/admin`
- `npm run format` — format `apps/public-site`
- `npm run format:admin` — format `apps/admin`

## Environment Variables

Each app requires the following environment variables:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous API key for client-side requests
- `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase service role key used by protected backend routes
- `VITE_DEV_TENANT` — tenant slug used during local development (default: `demo`)
- `VITE_APP_URL` — public site base URL used by RSS and sitemap generation
- `VITE_TENANT_ROOT_DOMAINS` — comma-separated tenant root domains used by hostname-based tenant resolution

A root `.env.example` is included for shared environment values.

For full setup details, see [docs/SETUP.md](./docs/SETUP.md).

See [docs/SUPABASE_SCHEMA.md](./docs/SUPABASE_SCHEMA.md) for the expected Supabase table and column layout.

## Architecture Notes

This project uses tenant-aware row access through Supabase. All queries in `packages/shared/supabase.ts` resolve the current tenant slug and then filter on `tenant_id`.

Tenant slugs are resolved by `packages/shared/tenant.ts`, which extracts the tenant from the hostname and falls back to `VITE_DEV_TENANT` for localhost.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for an architectural overview.

## Additional Documentation

- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — deployment and hosting guidance
- [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md) — admin panel usage and tenant permissions
