<<<<<<< HEAD
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
=======
# Command Connect 🚀

**Platform Komunikasi Resmi Korps Publik & Pers**  
[![Deploy Public Site](https://github.com/faturizki/command-connect/actions/workflows/deploy-public-site.yml/badge.svg)](https://github.com/faturizki/command-connect/actions/workflows/deploy-public-site.yml)
[![Deploy Admin Panel](https://github.com/faturizki/command-connect/actions/workflows/deploy-admin-panel.yml/badge.svg)](https://github.com/faturizki/command-connect/actions/workflows/deploy-admin-panel.yml)

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [ROADMAP-3.md](ROADMAP-3.md) | Roadmap pengembangan dan arsitektur |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Panduan lengkap deployment |
| [DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md) | Quick start deployment |
| [.github/WORKFLOWS.md](.github/WORKFLOWS.md) | GitHub Actions workflows |

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────┐
│         GitHub Repository (Main)             │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  Public Site     │  │  Admin Panel     │
│  (TanStack SSR)  │  │  (Vite SPA)      │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
    Cloudflare Pages    GitHub Pages
         │                     │
    command-connect.id   admin.command-connect.id
```

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
bun install

# Public site (http://localhost:4173)
make dev

# Admin panel (http://localhost:4174)
make dev-admin

# Backend PocketBase (http://localhost:8090)
make dev-backend
```

### Deployment

**Tanpa Konfigurasi Manual:**

```bash
# Setup wizard interaktif
make deploy-setup

# Test deployment locally
make deploy-test
```

**Atau Manual:**

```bash
# Build untuk production
make deploy-public    # Public site → Cloudflare Pages
make deploy-admin     # Admin panel → GitHub Pages

# Push ke main branch
git push origin main
```

Workflows akan trigger otomatis dan mendeploy ke:
- 🌐 **Public Site:** https://command-connect.id
- 📊 **Admin Panel:** https://admin.command-connect.id

---

## 📦 Project Structure

```
command-connect/
├── .github/
│   └── workflows/
│       ├── deploy-public-site.yml     # Cloudflare Pages CI/CD
│       └── deploy-admin-panel.yml     # GitHub Pages CI/CD
├── apps/
│   ├── public-site/                   # Public website (TanStack Start)
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── admin/                         # Admin dashboard (Vite + React)
│       ├── src/
│       ├── vite.config.ts
│       └── package.json
├── backend/                           # PocketBase server
│   ├── pb_migrations/
│   ├── pb_hooks/
│   ├── Makefile
│   └── pb_data/ (gitignored)
├── packages/
│   └── shared/                        # Shared TypeScript types & utils
├── scripts/
│   ├── build.sh                       # Build helper script
│   └── deploy-setup.sh                # Deployment setup wizard
├── Makefile                           # Root commands
├── wrangler.toml                      # Cloudflare Pages config
├── DEPLOYMENT.md                      # Detailed deployment guide
├── DEPLOYMENT-QUICKSTART.md           # Quick deployment start
└── package.json                       # Monorepo configuration
```

---

## 🔧 Available Commands

### Development

```bash
make dev              # Start public site
make dev-admin        # Start admin panel
make dev-backend      # Start PocketBase
```

### Build

```bash
make build            # Build public site
make build-admin      # Build admin panel
make preview          # Preview public site build
make preview-admin    # Preview admin panel build
```

### Quality

```bash
make lint             # ESLint check
make type-check       # TypeScript validation
make format           # Prettier formatting
```

### Deployment

```bash
make deploy-setup     # Interactive setup wizard
make deploy-test      # Test deployment configs
make deploy-public    # Build & test public site deployment
make deploy-admin     # Build & test admin panel deployment
```

### Utility

```bash
make install          # Install dependencies
make clean            # Clean all artifacts & node_modules
make help             # Show all available commands
```

---

## 🌐 Deployment Targets

### Public Site → Cloudflare Pages

| Komponen | Value |
|----------|-------|
| Framework | TanStack Start (SSR) |
| Platform | Cloudflare Pages |
| Domain | command-connect.id |
| Build | `bun install && cd apps/public-site && bun run build` |
| Output | `apps/public-site/dist/` |

**Keuntungan:**
- ✅ Full SSR support
- ✅ Global edge network
- ✅ Environment variables terintegrasi
- ✅ Automatic SSL/HTTPS

### Admin Panel → GitHub Pages

| Komponen | Value |
|----------|-------|
| Framework | Vite + React (SPA) |
| Platform | GitHub Pages |
| Domain | admin.command-connect.id |
| Build | `cd apps/admin && bun run build` |
| Output | `apps/admin/dist/` |

**Keuntungan:**
- ✅ Gratis dengan GitHub repo
- ✅ Automatic builds on push
- ✅ Simple configuration
- ✅ CDN global

---

## 📋 Setup Requirements

### Local Development

- **Node.js:** 20+ atau **Bun:** 1.1.0+
- **Git:** Latest
- **Docker:** (Optional, for PocketBase)

### GitHub Setup

- Repository secrets (for Cloudflare deployment)
- GitHub Pages enabled
- Actions enabled

### Cloudflare Setup

- Cloudflare account dengan domain terverifikasi
- Cloudflare API token dengan permissions
- Wrangler CLI terinstall (optional)

---

## 🔐 Environment Variables

### Development (`.env`)

```env
VITE_PB_URL=http://127.0.0.1:8090
VITE_APP_URL=http://localhost:4173
VITE_ADMIN_APP_URL=http://localhost:4174
```

### Production (GitHub Secrets)

```env
# Cloudflare
CLOUDFLARE_API_TOKEN=<token>
CLOUDFLARE_ACCOUNT_ID=<account-id>

# Optional overrides
VITE_PB_URL=https://api.command-connect.id
```

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk detail lengkap.

---

## 🔄 CI/CD Pipeline

```
Push to main
    ↓
GitHub Actions triggers
    ├─ deploy-public-site.yml
    │   ├─ Lint & type-check
    │   ├─ Build TanStack app
    │   └─ Deploy to Cloudflare Pages
    │
    └─ deploy-admin-panel.yml
        ├─ Lint & type-check
        ├─ Build Vite app
        └─ Deploy to GitHub Pages
```

Status workflows: [Actions](https://github.com/faturizki/command-connect/actions)

---

## 📊 Monitoring

### Deployment Status

- **Cloudflare Pages:** [Dashboard](https://dash.cloudflare.com/pages)
- **GitHub Pages:** [Settings → Pages](https://github.com/settings/pages)
- **GitHub Actions:** [Workflows](https://github.com/faturizki/command-connect/actions)

### Logs

```bash
# View GitHub Actions logs
gh run list --repo faturizki/command-connect
gh run view <run-id> --repo faturizki/command-connect --log
```

---

## 🐛 Troubleshooting

### Build Fails

1. Check logs di GitHub Actions
2. Verify dependencies: `bun install`
3. Check Node version: `node --version`
4. Test locally: `make build` atau `make build-admin`

### Deployment Fails

1. Verify GitHub Secrets configured
2. Check Cloudflare API token valid
3. Verify domain DNS records
4. Check GitHub Pages enabled

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk troubleshooting detail.

---

## 📚 Dokumentasi Lengkap

- **[ROADMAP-3.md](ROADMAP-3.md)** - Development roadmap & architecture
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment guide (Cloudflare + GitHub Pages)
- **[DEPLOYMENT-QUICKSTART.md](DEPLOYMENT-QUICKSTART.md)** - Quick start deployment
- **[.github/WORKFLOWS.md](.github/WORKFLOWS.md)** - GitHub Actions workflows
- **[backend/README.md](backend/README.md)** - PocketBase setup
- **[apps/public-site/](apps/public-site/)** - Public site documentation
- **[apps/admin/](apps/admin/)** - Admin panel documentation

---

## 🤝 Contributing

Kontribusi welcome! Silakan:

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

[Tentukan license yang sesuai]

---

## 📞 Support

Untuk pertanyaan atau issue:
- 📧 Email: [support email]
- 🐙 GitHub Issues: [Link ke issues]
- 💬 Discussions: [Link ke discussions]

---

## 🎉 Status

| Komponen | Status | URL |
|----------|--------|-----|
| Public Site | ✅ Deployed | https://command-connect.id |
| Admin Panel | ✅ Deployed | https://admin.command-connect.id |
| Backend | ✅ Running | https://api.command-connect.id |

---

**Made with ❤️ by Command Connect Team**
>>>>>>> feead28 (feat: add README.md with project documentation, setup instructions, and deployment details)
