# 🚀 DEPLOYMENT GUIDE - Command Connect

Dokumentasi lengkap untuk deployment Public Site ke Cloudflare Pages dan Admin Panel ke GitHub Pages.

---

## 📋 Arsitektur Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Branch (GitHub)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴───────────────┐
        │                            │
        ▼                            ▼
┌──────────────────────┐  ┌──────────────────────┐
│ Public Site Workflow │  │  Admin Panel Workflow │
│  (deploy-public-     │  │ (deploy-admin-panel  │
│   site.yml)          │  │  .yml)               │
└────────┬─────────────┘  └──────────┬───────────┘
         │                           │
         ▼                           ▼
    Cloudflare             GitHub Pages
    Pages (SSR)           (Static SPA)
    │                     │
    └─── command-         └─── faturizki.github.io
         connect.id            (user/repo)
```

---

## 📱 Deployment Targets

### 1. **Public Site → Cloudflare Pages (SSR)**

| Aspek | Value |
|-------|-------|
| Framework | TanStack Start (SSR) |
| Deployment | Cloudflare Pages |
| Domain | `command-connect.id` |
| Build Output | `dist/` + `dist/server.mjs` |
| Environment | Production-ready |

**Keuntungan Cloudflare Pages:**
- ✅ Full SSR support dengan Nitro
- ✅ Global edge network (performa tinggi)
- ✅ Environment variables terintegrasi
- ✅ Automatic builds & deployments
- ✅ Free tier tersedia

### 2. **Admin Panel → GitHub Pages (Static SPA)**

| Aspek | Value |
|-------|-------|
| Framework | Vite + React |
| Deployment | GitHub Pages |
| Domain | `admin.command-connect.id` atau subdomain GitHub |
| Build Output | `dist/` (static files) |
| Environment | Protected by auth |

**Keuntungan GitHub Pages:**
- ✅ Gratis dengan GitHub repo
- ✅ Automatic builds saat push ke main
- ✅ Easy SSL/HTTPS
- ✅ CDN global

---

## 🔧 Setup Cloudflare Pages (Public Site)

### Prerequisites
- Cloudflare account dengan domain terverifikasi
- Cloudflare API Token dengan permission Pages:Deploy

### Step 1: Dapatkan Credentials

1. **Cloudflare API Token:**
   - Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Buka **My Profile** → **API Tokens**
   - Click "Create Token" → Pilih **"Edit Cloudflare Workers"** template
   - Konfigurasi:
     - **Permissions:** `Account:Cloudflare Pages:Deploy`
     - **Resources:** All zones / All accounts
   - Copy token dan simpan di GitHub Secrets

2. **Cloudflare Account ID:**
   - Buka dashboard dan cari di URL atau bagian Account Overview
   - Format: 32 karakter hex

### Step 2: Setup GitHub Secrets

Repository → Settings → Secrets and variables → Actions

```
CLOUDFLARE_API_TOKEN      = <token dari step 1>
CLOUDFLARE_ACCOUNT_ID     = <account id dari step 1>
VITE_PB_URL              = https://api.command-connect.id  (optional)
```

### Step 3: Konfigurasi Domain di Cloudflare

1. Di Cloudflare dashboard, buat Pages project baru
2. Koneksikan GitHub repo
3. Build settings:
   - **Build command:** `bun install && cd apps/public-site && bun run build`
   - **Build output directory:** `apps/public-site/dist`
   - **Root directory:** `/`
   - **Environment variables:**
     ```
     VITE_PB_URL=https://api.command-connect.id
     VITE_APP_URL=https://command-connect.id
     ```

4. Setup custom domain (`command-connect.id`)

### Step 4: Verifikasi Deployment

```bash
# Deploy dari GitHub Actions
# Atau manual: bun run build && wrangler pages deploy dist

# Test production
curl https://command-connect.id/
```

**Output yang diharapkan:** HTML SSR response

---

## 🐙 Setup GitHub Pages (Admin Panel)

### Step 1: Aktifkan GitHub Pages

Repository → Settings → Pages

```
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

> **Note:** Kalau admin panel di folder `apps/admin/dist`, perlu workflow khusus upload artifact

### Step 2: Setup Custom Domain (Opsional)

Di GitHub Pages settings, masukkan domain custom: `admin.command-connect.id`

### Step 3: Configure DNS (Jika Custom Domain)

Di Cloudflare/registrar DNS, tambahkan:

```
Type: CNAME
Name: admin.command-connect.id
Value: <github-pages-domain>
```

Atau gunakan GitHub Pages IP default:

```
Type: A
Name: admin.command-connect.id
Value: 185.199.108.153 (GitHub Pages IP)
```

### Step 4: Environment Variables

Admin panel membaca dari `.env.production`:

```env
VITE_PB_URL=https://api.command-connect.id
VITE_ADMIN_APP_URL=https://admin.command-connect.id
```

---

## 🔄 GitHub Actions Workflows

### 1. Public Site Deployment (`deploy-public-site.yml`)

```yaml
Trigger: 
  - Push ke main
  - Pull Request ke main

Actions:
  1. Checkout code
  2. Setup Bun environment
  3. Install dependencies
  4. Lint & type-check
  5. Build TanStack Start app
  6. Deploy ke Cloudflare Pages (push only)
  7. Comment PR dengan preview link
```

**Secrets Required:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

### 2. Admin Panel Deployment (`deploy-admin-panel.yml`)

```yaml
Trigger:
  - Push ke main (apps/admin/**, workflow files)
  - Pull Request ke main (apps/admin/**)

Actions:
  1. Checkout code
  2. Setup Bun environment
  3. Install dependencies
  4. Lint & type-check
  5. Build Vite app
  6. Setup GitHub Pages
  7. Upload dist/ artifact
  8. Deploy ke GitHub Pages (push only)
  9. Comment PR dengan deployment info
```

**Permissions Required:**
- `contents: read`
- `pages: write`
- `id-token: write`

---

## 🌐 Environment Variables

### Development

```bash
cp .env.example .env

# Edit .env:
VITE_PB_URL=http://127.0.0.1:8090
VITE_APP_URL=http://localhost:4173
VITE_ADMIN_APP_URL=http://localhost:4174
```

### Production

**Cloudflare Pages** (via wrangler.toml & GitHub Secrets):
```
VITE_PB_URL=https://api.command-connect.id
VITE_APP_URL=https://command-connect.id
```

**GitHub Pages** (via GitHub Secrets → injected at build):
```
VITE_PB_URL=https://api.command-connect.id
VITE_ADMIN_APP_URL=https://admin.command-connect.id
```

---

## 📊 Monitoring & Logs

### Cloudflare Pages

```bash
# View deployment logs
wrangler pages deployment list --project-name=command-connect-public

# Real-time logs
wrangler pages deployment tail --project-name=command-connect-public
```

### GitHub Pages

Repository → Actions → Workflow runs

---

## 🐛 Troubleshooting

### Cloudflare Pages

| Error | Solusi |
|-------|--------|
| `API Token invalid` | Regenerate token di Cloudflare dashboard |
| `Account ID not found` | Verify Account ID format (32 hex chars) |
| `Build output not found` | Check vite config output path |
| `Timeout` | Increase build timeout di Cloudflare settings |

### GitHub Pages

| Error | Solusi |
|-------|--------|
| `GitHub Pages disabled` | Enable di repo Settings → Pages |
| `Artifact not found` | Check `actions/upload-pages-artifact@v3` path |
| `Custom domain not working` | Verify DNS CNAME record & certificate |
| `React routing broken` | Update `base` di vite.config.ts untuk subpath |

---

## 📝 Local Testing

### Test Public Site Build (Cloudflare)

```bash
cd apps/public-site
bun run build

# Preview production build
wrangler pages dev dist --local
```

### Test Admin Panel Build (GitHub Pages)

```bash
cd apps/admin
bun run build

# Preview static site
bun run preview
# atau
cd dist && python -m http.server 8000
```

---

## 🔐 Security Checklist

- [ ] Cloudflare API token dibuat dengan minimal permissions
- [ ] GitHub Secrets tidak di-expose di logs
- [ ] Backend API URL aman (HTTPS)
- [ ] Admin panel dilindungi auth
- [ ] Environment variables tidak di-hardcode
- [ ] Build artifacts tidak di-commit ke git
- [ ] `.gitignore` include `dist/`, `pb_data/`, `.env`

---

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/)
- [TanStack Start Deployment](https://tanstack.com/start/latest)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## 🔄 Rollback Procedures

### Cloudflare Pages

```bash
# List recent deployments
wrangler pages deployment list --project-name=command-connect-public

# Rollback ke deployment sebelumnya
wrangler pages deployment rollback \
  --project-name=command-connect-public \
  --deployment-id=<previous-deployment-id>
```

### GitHub Pages

- GitHub Pages otomatis menggunakan commit terakhir
- Untuk rollback: push commit sebelumnya atau force push

---

## 📈 Next Steps

1. ✅ Setup Cloudflare Pages project
2. ✅ Verifikasi custom domain
3. ✅ Test GitHub Actions workflows
4. ✅ Monitor first deployment
5. ✅ Setup monitoring/alerting
6. ✅ Document runbooks tim

---

**Deployment berhasil! 🎉**

Untuk pertanyaan atau issue, buka discussion di repository.
