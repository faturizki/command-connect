# Deployment Guide

This guide explains how to deploy the `command-connect` public site and admin panel together on Vercel with Supabase as the backend.

## Deployment Architecture

- Public Site: `apps/public-site` (SPA)
- Admin Panel: `apps/admin` (SPA)
- Backend: Supabase hosted project
- Deployment Host: Vercel
- URL targets:
  - `https://infopers.web.id/` → Public Site
  - `https://infopers.web.id/admin/` → Admin Panel

## Build and Deploy

From the repository root:

```bash
npm install
npm run build
```

The build step:

1. Builds the public SPA in `apps/public-site`
2. Builds the admin SPA in `apps/admin`
3. Prepares Vercel output under `.vercel/output`

On Vercel, configure the project to deploy from the repository root. Vercel will publish:

- `/` from the public site build
- `/admin/` from the admin build

## Production Environment Variables

Set these environment variables in Vercel:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_URL=https://infopers.web.id
VITE_TENANT_ROOT_DOMAINS=infopers.web.id
```

### Notes

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must point to the same Supabase project for both apps.
- `SUPABASE_SERVICE_ROLE_KEY` should be kept secret and only used server-side.
- `VITE_APP_URL` should be the public root domain.
- `VITE_TENANT_ROOT_DOMAINS` controls hostname tenant resolution.

## Vercel Configuration

This repository prepares Vercel output under `.vercel/output` after `npm run build`.

On Vercel:

- Set the build command to `npm run build`
- Set the root directory to `/`
- Add the required environment variables
- Deploy from the repository root

## Admin Panel under `/admin/`

The admin app is built with a base path of `/admin/` so it can be hosted from the same Vercel project as the public site.

During build, admin assets are included in the Vercel static output so the admin panel is available at:

```text
https://infopers.web.id/admin/
```

## Supabase Backend

The backend for both apps is Supabase.

- Public site uses Supabase for frontend data access
- Admin panel uses Supabase auth and data access controls
- Shared Supabase helpers are implemented in `packages/shared/supabase.ts`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the public site locally:

```bash
make dev
```

3. Run the admin panel locally:

```bash
make dev-admin
```

## Post-Deployment Checklist

- [ ] `npm run build` succeeds
- [ ] `.vercel/output/` is generated
- [ ] Vercel environment variables are configured
- [ ] Public site loads at `/`
- [ ] Admin panel loads at `/admin/`
- [ ] Supabase backend is reachable
- [ ] Static admin assets load correctly
