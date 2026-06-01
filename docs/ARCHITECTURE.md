# Architecture Overview

This repository is organized as a frontend monorepo with shared Supabase helpers and tenant-aware access. The architecture is designed for multi-tenant content management and a public-facing site.

## Monorepo Layout

- `apps/public-site/`
  - Public website built with React and Vite
  - Server entry handles RSS and sitemap generation
  - Uses shared Supabase helpers for tenant-aware data fetching
- `apps/admin/`
  - Admin dashboard for managing content
  - Uses Supabase auth and tenant permission checks
- `packages/shared/`
  - Shared utilities, models, and Supabase data access logic
  - Ensures both apps use the same tenant and data access policies

## Tenant Detection

Tenant slug resolution is implemented in `packages/shared/tenant.ts`.

- For `localhost` and `127.0.0.1`, the app falls back to `VITE_DEV_TENANT`.
- For production hostnames, tenant slugs are derived from wildcard subdomains.
- Example:
  - `clienta.infopers.web.id` → tenant `clienta`
  - `infopers.web.id` → root tenant or default fallback

## Supabase Integration

The shared Supabase layer is located in `packages/shared/supabase.ts`.

- `getSupabaseClient()` returns a single Supabase client instance.
- `getTenantId(tenantSlug)` resolves the current `tenant_id` and caches it.
- All table queries include `.eq('tenant_id', tenantId)` to enforce tenant isolation.

### Security and RLS

- Tenant isolation must be enforced at the database level using Row Level Security (RLS). Relying solely on `.eq('tenant_id', tenantId)` in application code is unsafe when using client-side anon keys.
- Configure RLS policies that validate `tenant_id` from the JWT claims or require server-side RPCs/service-role for cross-tenant operations. See `docs/SETUP.md` for example policy snippets.

### Admin Auth

- `apps/admin` signs in users using Supabase email/password auth.
- After sign-in, admin access is validated by looking up the user in the `tenant_users` table.
- User roles are expected to be `admin`, `editor`, or `viewer`.

## Shared Data Models

Shared models are defined in `packages/shared/types.ts` and include:

- `NewsArticle`
- `EventItem`
- `Officer`
- `GalleryItem`
- `PressKitItem`
- `ContactMessage`
- `SettingRecord`
- `Tenant`
- `TenantUser`

All main content records include a `tenant_id` field for tenant isolation.

## Public Site Features

- Server-side rendering with TanStack React Start
- RSS feed generation at `/rss.xml`
- Sitemap generation at `/sitemap.xml`
- Tenant-aware news listing and search

## Admin Panel Features

- Tenant-aware CRUD operations for content
- Centralized authentication state via `useAdminAuth()`
- Dashboard metrics for news, events, contacts, and officers
- Shared Supabase helper functions for common operations

## Deployment Notes

- The public site and admin app are separate deploy targets.
- Both apps must be configured with the same Supabase credentials.
- Tenant subdomains should resolve to the public app host in production.
- Local development uses `VITE_DEV_TENANT` for tenant simulation.
