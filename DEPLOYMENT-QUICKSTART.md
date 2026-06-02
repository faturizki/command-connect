# 🚀 Quick Start - Deployment Command Connect

Panduan cepat untuk deploy Public Site dan Admin Panel bersama ke Vercel dengan backend Supabase.

---

## 1️⃣ Build Everything

```bash
npm install
npm run build
```

Perintah ini:

- membangun public site SPA di `apps/public-site`
- membangun admin SPA di `apps/admin`
- menyiapkan output Vercel di `.vercel/output`

---

## 2️⃣ Configure Vercel

Di Vercel, buat project baru dari repository ini.

- Build command: `npm run build`
- Root directory: `/`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_APP_URL=https://infopers.web.id`
- `VITE_TENANT_ROOT_DOMAINS=infopers.web.id`

---

## 3️⃣ Deploy

Push ke `main`:

```bash
git push origin main
```

Vercel akan membangun dan menerbitkan:

- `https://infopers.web.id/` → Public Site
- `https://infopers.web.id/admin/` → Admin Panel

---

## 🔄 Development

```bash
# Public site
make dev              # http://localhost:4173

# Admin panel
make dev-admin        # http://localhost:4174
```

---

## 📋 Checklist

- [ ] `npm install` berhasil
- [ ] `npm run build` berhasil
- [ ] `.vercel/output/` terbentuk
- [ ] Vercel project terkonfigurasi
- [ ] Environment vars di Vercel sudah diset
- [ ] Public site tersedia di `/`
- [ ] Admin panel tersedia di `/admin/`
- [ ] Supabase backend dapat diakses

---

## ✅ Hasil Target

- Public Site: `https://infopers.web.id/`
- Admin Panel: `https://infopers.web.id/admin/`

