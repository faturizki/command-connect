# Supabase Schema Reference

This application requires a Supabase schema that supports tenant-aware content access.

## Required Tables

### `tenants`

Columns:

- `id` — `uuid` or `text`
- `slug` — `text`
- `name` — `text`
- `plan` — `text`
- `active` — `boolean`
- `created_at` — `timestamp`

### `tenant_users`

Columns:

- `id` — `uuid` or `text`
- `tenant_id` — foreign key to `tenants.id`
- `user_id` — `text`
- `role` — `text` (`admin`, `editor`, `viewer`)
- `created_at` — `timestamp`

## Content Tables

All public/admin content tables must include a `tenant_id` column for row-level isolation.

### `news`

Columns:

- `id`
- `tenant_id`
- `title` — JSON/JSONB with `id` and `en`
- `excerpt` — JSON/JSONB with `id` and `en`
- `body` — JSON/JSONB with `id` and `en`
- `cover`
- `category` — JSON/JSONB with `id` and `en`
- `date`
- `published` — boolean
- `slug`

### `events`

Columns:

- `id`
- `tenant_id`
- `title` — JSON/JSONB with `id` and `en`
- `excerpt` — JSON/JSONB with `id` and `en`
- `date`
- `location` — JSON/JSONB with `id` and `en`
- `cover`
- `category` — JSON/JSONB with `id` and `en`
- `finished` — boolean

### `officers`

Columns:

- `id`
- `tenant_id`
- `rank_code`
- `rank` — JSON/JSONB
- `name`
- `position` — JSON/JSONB
- `photo`
- `status` — text (`active` | `past`)
- `term_start`
- `term_end`
- `bio` — JSON/JSONB
- `order`

### `gallery`

Columns:

- `id`
- `tenant_id`
- `image`
- `caption` — JSON/JSONB
- `taken_at`
- `order`

### `presskit`

Columns:

- `id`
- `tenant_id`
- `name`
- `file_asset`
- `size_label`
- `type`
- `order`

### `contact_messages`

Columns:

- `id`
- `tenant_id`
- `name`
- `org`
- `email`
- `message`
- `status` — text (`new`, `read`, `replied`)
- `created_at`

### `settings`

Columns:

- `id`
- `tenant_id`
- `key`
- `value` — JSON/JSONB

## Notes

- Every query in `packages/shared/supabase.ts` applies `.eq('tenant_id', tenantId)` for tenant isolation.
- The public site and admin app share the same Supabase project and schema.
- The admin panel uses Supabase auth for login and the `tenant_users` table for permission validation.
