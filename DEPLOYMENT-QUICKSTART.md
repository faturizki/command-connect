# 🚀 Quick Start - Deployment Command Connect

Panduan cepat setup deployment untuk 2 platform.

---

## 1️⃣ PUBLIC SITE → CLOUDFLARE PAGES

### Persiapan (5 menit)

```bash
# 1. Dapatkan credentials Cloudflare
# https://dash.cloudflare.com → My Profile → API Tokens
# Buat token dengan permission: Pages:Deploy

# 2. Ambil Account ID
# Cari di Cloudflare dashboard atau lihat di URL

# 3. Tambahkan GitHub Secrets
# Repository Settings → Secrets and variables → Actions
#
# CLOUDFLARE_API_TOKEN = <your-token>
# CLOUDFLARE_ACCOUNT_ID = <your-account-id>
```

### Konfigurasi Cloudflare

```bash
# 1. Login ke Cloudflare Dashboard
# 2. Pergi ke Pages
# 3. "Connect to Git" → Select repository
# 4. Build settings:

Build command:        bun install && cd apps/public-site && bun run build
Output directory:     apps/public-site/dist
Root directory:       /
Node version:         20.0.0

# 5. Environment variables:
VITE_PB_URL          https://api.command-connect.id
VITE_APP_URL         https://command-connect.id

# 6. Setup custom domain: command-connect.id
```

### Deploy!

```bash
# Push ke main branch
git push origin main

# Lihat workflow di: Actions tab di GitHub
# Deploy selesai dalam 2-3 menit
# Cek: https://command-connect.id
```

---

## 2️⃣ ADMIN PANEL → GITHUB PAGES

### Persiapan (3 menit)

```bash
# Repository Settings → Pages

Source:               Deploy from a branch
Branch:               main
Folder:               / (root)

# Workflow otomatis: .github/workflows/deploy-admin-panel.yml
```

### Custom Domain (Optional)

```bash
# Di GitHub Pages settings, masukkan:
admin.command-connect.id

# Setup DNS CNAME:
admin.command-connect.id CNAME faturizki.github.io
```

### Deploy!

```bash
# Push ke main branch
git push origin main

# Workflow akan:
# 1. Build admin panel
# 2. Upload ke GitHub Pages
# 3. Deploy dalam 1-2 menit

# Cek: https://admin.command-connect.id
# atau: https://faturizki.github.io/command-connect/
```

---

## 🔄 Workflow Sehari-hari

### Development

```bash
# Public site
npm run dev              # http://localhost:4173

# Admin panel
npm run dev:admin       # http://localhost:4174

# Backend (PocketBase)
cd backend && make dev  # http://127.0.0.1:8090
```

### Deploy ke Production

```bash
# 1. Commit & push
git add .
git commit -m "feature: new feature"
git push origin main

# 2. GitHub Actions otomatis trigger
# Lihat di: GitHub Actions tab

# 3. Setelah build selesai:
# - Public Site live di: https://command-connect.id
# - Admin Panel live di: https://admin.command-connect.id
```

### Monitor Deployment

```bash
# Cloudflare Pages
wrangler pages deployment list --project-name=command-connect-public

# GitHub Pages
# Lihat di: GitHub Actions → deploy-admin-panel
```

---

## ⚠️ Troubleshooting Cepat

### Cloudflare Pages Error

```
❌ "Permission denied"
→ Verify CLOUDFLARE_API_TOKEN di GitHub Secrets

❌ "Account ID invalid"  
→ Check format (32 hex characters)

❌ "Build failed"
→ Check logs di Cloudflare dashboard
→ Verify bun install berhasil
```

### GitHub Pages Error

```
❌ "Pages not enabled"
→ Settings → Pages → Enable

❌ "Custom domain not working"
→ Verify DNS record (CNAME)
→ Wait 5-10 minutes untuk propagasi

❌ "Deployment stuck"
→ Check file: apps/admin/dist/
→ Verify upload-pages-artifact action
```

---

## 📋 Checklist Pertama Kali

- [ ] Cloudflare credentials di GitHub Secrets
- [ ] Cloudflare Pages project dibuat
- [ ] Custom domain terverifikasi
- [ ] GitHub Pages enabled
- [ ] DNS CNAME record dikonfigurasi
- [ ] Test push ke main
- [ ] Verifikasi kedua site live
- [ ] Setup monitoring (optional)

---

## 🎯 Success!

✅ Public Site: https://command-connect.id  
✅ Admin Panel: https://admin.command-connect.id  
✅ Backend: https://api.command-connect.id  

Deployment selesai! 🎉
