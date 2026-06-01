# Deployment Guide

This guide explains how to deploy the `command-connect` public site and admin panel in production.

## Build Targets

This project separates the public website and admin dashboard into two independent build outputs.

- Public site: `npm run build`
- Admin app: `npm run build:admin`

Both commands should be executed from the repository root.

## Production Environment Variables

Set the same Supabase variables for both applications:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_DEV_TENANT=demo
VITE_APP_URL=https://your-public-site-domain.com
VITE_TENANT_ROOT_DOMAINS=infopers.web.id,infopers.biz.id
```

### Notes

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must point to the same Supabase project for both apps.
- `VITE_APP_URL` should be the public site base URL. It is used for RSS and sitemap generation.
- `VITE_DEV_TENANT` is only required for local development and can be omitted in production.

## Hosting Recommendations

### Public Site

The public site is built with Vite and supports server-side rendering via `apps/public-site/src/server.ts`.

Recommended deployment options:

- Vercel
- Netlify
- Cloudflare Pages with custom serverless SSR logic
- Any hosting provider that supports deploying a Vite SSR application

### Admin App

The admin app is a client-side Vite SPA.

Recommended deployment options:

- Vercel
- Netlify
- Netlify Drop
- Any static hosting provider that supports Vite build output

## Tenant Subdomain Setup

For multi-tenant mode, production hostnames should use wildcard subdomains.

Example mapping:

- `client1.example.com` → tenant slug `client1`
- `client2.example.com` → tenant slug `client2`

In production, point wildcard DNS to your public site host and configure the hosting service to accept subdomain traffic.

## Supabase Security

The client-side public site uses the Supabase anon key, so all server-side tenant filtering must be enforced in the application.

Important security points:

- All shared queries use `.eq('tenant_id', tenantId)`
- Admin users are validated against the `tenant_users` table
- Sensitive operations should always use the resolved tenant ID from the tenant slug

## Post-Deployment Checklist

- Verify public site builds successfully
- Verify admin app builds successfully
- Confirm environment variables are available to both deployed apps
- Test tenant subdomain access with at least one valid tenant slug
- Confirm RSS and sitemap endpoints work for the deployed site
