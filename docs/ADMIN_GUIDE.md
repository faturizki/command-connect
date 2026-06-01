# Admin Panel Guide

This guide explains how the admin dashboard is used and how tenant access is enforced.

## Admin Access Flow

1. Admin users sign in with email and password.
2. The app authenticates with Supabase auth.
3. After sign-in, the admin user must be present in the `tenant_users` table for the current tenant.
4. The app loads tenant-specific dashboard data only when access is confirmed.

## Tenant Permissions

The admin app supports these roles:

- `admin`
- `editor`
- `viewer`

If a signed-in user is not found in `tenant_users` for the tenant slug, sign-in is rejected.

## Sections in the Admin Dashboard

The admin panel includes these main sections:

- `dashboard` — summary metrics for news, events, unread messages, and active officers
- `berita` — manage news articles
- `kegiatan` — manage events
- `struktur` — manage officers
- `galeri` — manage gallery items
- `presskit` — manage press kit assets
- `kontak` — manage contact messages
- `settings` — tenant-level settings

## Tenant Context

The admin app resolves the current tenant from the browser hostname.

- `localhost` resolves to `VITE_DEV_TENANT`
- Production subdomains resolve to tenant slug via `packages/shared/tenant.ts`

That tenant context is used for all admin CRUD operations.

## Common Admin Tasks

### Create a News Article

- Open the `berita` section
- Enter title, excerpt, body, cover, category, and publish status
- Save to create a tenant-scoped article

### Manage Events

- Open the `kegiatan` section
- Add or update event details with date, location, cover, and category
- Save changes to keep events within the current tenant

### Review Contact Messages

- Open the `kontak` section
- View new messages and mark them read
- Contact messages are scoped to the tenant via `tenant_id`

## Troubleshooting

- If login fails, verify the Supabase auth credentials and `tenant_users` entry.
- If content does not appear, verify the current tenant slug and `tenant_id` filter.
- For localhost testing, use a valid `VITE_DEV_TENANT` value in `.env`.
