# Vercel Deployment Workflow

This repository deploys both the public website and admin panel to Vercel as a single project.

## Deployment Strategy

- Public site: `apps/public-site` (SPA)
- Admin panel: `apps/admin` (SPA)
- Hosting: Vercel
- Primary domain: `https://infopers.web.id/`
- Admin URL: `https://infopers.web.id/admin/`
- Backend: Supabase

## Build Flow

1. Checkout repository
2. Install dependencies
3. Run `npm run build`
4. Build public and admin apps
5. Prepare `.vercel/output`
6. Publish to Vercel

## Environment Variables

Set these in the Vercel dashboard:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_URL=https://infopers.web.id
VITE_TENANT_ROOT_DOMAINS=infopers.web.id
```

## CI Validation

This repository uses `.github/workflows/ci.yml` for pre-deploy validation:

- `typecheck`
- `lint`
- `test`
- `build-public-site`
- `build-admin`

If any CI job fails, the Vercel deployment should not proceed.
