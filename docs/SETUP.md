# Setup Guide

This document explains how to configure the `command-connect` monorepo for local development and production builds.

## Prerequisites

- Node.js (recommended: latest stable LTS)
- npm
- Supabase project with:
  - `tenants` table
  - `tenant_users` table
  - `news`, `events`, `officers`, `gallery`, `presskit`, `contact_messages`, and `settings` tables

## Install Dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for the monorepo and makes both apps available.

## Configure Environment Variables

Both `apps/public-site` and `apps/admin` require the same Supabase environment variables.

1. Copy the example file:

```bash
cp apps/public-site/.env.example apps/public-site/.env
cp apps/admin/.env.example apps/admin/.env
```

2. Update the values in each `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DEV_TENANT=demo
VITE_APP_URL=http://localhost:4173
```

### Notes

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must match your Supabase project credentials.
- `VITE_DEV_TENANT` is used when running locally on `localhost` or `127.0.0.1`.
- `VITE_APP_URL` is used for RSS and sitemap generation in `apps/public-site`.

## Local Development

Start the public site:

```bash
npm run dev
```

Start the admin dashboard:

```bash
npm run dev:admin
```

Open the apps in your browser at the URLs printed by Vite.

## Build and Preview

Build the public site:

```bash
npm run build
```

Build the admin app:

```bash
npm run build:admin
```

Preview the public site build:

```bash
npm run preview
```

Preview the admin build:

```bash
npm run preview:admin
```

## Linting and Formatting

Lint the public site:

```bash
npm run lint
```

Lint the admin app:

```bash
npm run lint:admin
```

Format the public site:

```bash
npm run format
```

Format the admin app:

```bash
npm run format:admin
```

## Troubleshooting

- If environment variables are not loaded, verify the `.env` files are placed in each app root.
- If Supabase queries fail, ensure the tables exist and include the `tenant_id` column.
- For local tenant testing, use `VITE_DEV_TENANT=demo` or a valid tenant slug.
