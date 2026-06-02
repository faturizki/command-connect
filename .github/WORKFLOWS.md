# 🔄 Deployment Workflows

This repository now deploys both the public site and admin panel together on Vercel.

## 📋 Current Deployment Strategy

- Public Site: `apps/public-site` (SSR)
- Admin Panel: `apps/admin` (static SPA)
- Deployment Host: Vercel
- Public URL: `https://yourdomain.com/`
- Admin URL: `https://yourdomain.com/admin/`

Vercel handles build and publish from the repository root using `npm run build`.

## 🛠️ Vercel Build Steps

1. Checkout code from GitHub
2. Install dependencies
3. Run `npm run build`
4. Build public SSR site and admin SPA
5. Prepare `.vercel/output`
6. Publish deploy to Vercel

## 🔧 Environment Variables

Set these in the Vercel dashboard:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_APP_URL=https://yourdomain.com
VITE_TENANT_ROOT_DOMAINS=yourdomain.com
```

## ⚠️ Legacy GitHub Actions Workflows

The repository contains old workflows under `.github/workflows/` for Cloudflare Pages and GitHub Pages deployment. These are legacy artifacts and may not be used for current Vercel deployment.

If Vercel deployment is active, focus on the Vercel project dashboard instead of GitHub Actions for deployment status.
