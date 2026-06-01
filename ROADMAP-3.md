# ROADMAP — Command Connect
### Platform Komunikasi Resmi Korps Publik & Pers
> **Stack:** TanStack Start · React 19 · PocketBase · Tailwind CSS v4 · TypeScript

---

## Arsitektur Target

```
command-connect/
├── apps/
│   ├── public-site/        # Website publik (read-only, SSR)
│   └── admin/              # Dashboard admin (CRUD, auth-protected)
├── backend/
│   ├── pb_migrations/      # Skema & seed database
│   ├── pb_hooks/           # Server-side hooks (JS)
│   └── pb_data/            # Runtime data (di .gitignore)
├── packages/
│   └── shared/
│       ├── types.ts        # Shared TypeScript types
│       └── pb.ts           # PocketBase client factory
└── package.json            # Bun workspaces monorepo root
```

---

## FASE 0 — Restrukturisasi Repo
**Estimasi: 1–2 hari**

### 0.1 Setup Monorepo
- [ ] Inisialisasi Bun Workspaces di root `package.json`
- [ ] Pindahkan kode existing ke `apps/public-site/`
- [ ] Buat scaffold `apps/admin/` (TanStack Start baru)
- [ ] Buat `packages/shared/` dengan types dari `mock-data.ts`
- [ ] Update semua import path

### 0.2 Setup PocketBase Backend
- [ ] Download PocketBase binary ke `backend/`
- [ ] Buat `backend/Makefile` untuk dev server (`make dev` → port 8090)
- [ ] Tambahkan `backend/pb_data/` ke `.gitignore`
- [ ] Buat `backend/README.md` dengan instruksi setup

### 0.3 Environment & CI
- [ ] Buat `.env.example` untuk kedua apps
- [ ] Setup GitHub Actions: lint + typecheck on push
- [ ] Buat `docker-compose.yml` untuk PocketBase (opsional)

---

## FASE 1 — Database & Backend (PocketBase)
**Estimasi: 2–3 hari**

### 1.1 Collections Schema

| Collection | Fields Utama |
|---|---|
| `officers` | rankCode, rank (JSON), name, position (JSON), photo (file), status, termStart, termEnd, bio (JSON) |
| `news` | title (JSON), excerpt (JSON), body (JSON rich text), cover (file), category (JSON), date, published (bool) |
| `events` | title (JSON), excerpt (JSON), date, location (JSON), cover (file), category (JSON) |
| `gallery` | image (file), caption (JSON), takenAt, order |
| `press_kit` | name, fileAsset (file), sizeLabel, type, order |
| `contacts` | name, org, email, message, status (new/read/replied), createdAt |
| `settings` | key (unique), value (JSON) — untuk konten statis (visi, misi, dll) |

### 1.2 Auth & Roles
- [ ] Aktifkan PocketBase **Admin UI** (port 8090/_/)
- [ ] Buat collection `_superusers` (bawaan PocketBase) untuk admin
- [ ] Set API Rules:
  - `officers`, `news`, `events`, `gallery`, `press_kit` → **list/view: public**, **create/update/delete: admin only**
  - `contacts` → **create: public**, **list/view/delete: admin only**
  - `settings` → **view: public**, **update: admin only**

### 1.3 PocketBase Hooks (`pb_hooks/`)
- [ ] `onRecordCreate` untuk `contacts` → kirim email notifikasi ke admin
- [ ] `onRecordUpdate` untuk `news` dengan `published=true` → catat log aktivitas
- [ ] Auto-generate `slug` dari `title.id` saat berita dibuat

### 1.4 Migrasi & Seed Data
- [ ] Buat `pb_migrations/001_initial_schema.js`
- [ ] Buat `pb_migrations/002_seed_data.js` (isi dari `mock-data.ts` existing)

---

## FASE 2 — Public Site (Sambungkan ke PocketBase)
**Estimasi: 3–4 hari**

### 2.1 PocketBase Client
- [ ] Install `pocketbase` SDK di `packages/shared/`
- [ ] Buat `pb.ts` — singleton client dengan base URL dari env
- [ ] Buat typed query helpers:
  ```ts
  getNews(lang, page, perPage)
  getEvents(upcoming?: boolean)
  getOfficers(status: 'active' | 'past')
  getGallery()
  getPressKit()
  getSetting(key)
  ```

### 2.2 Ganti Mock Data → Real API
- [ ] `index.tsx` — fetch news + events + officers (SSR via TanStack Start loader)
- [ ] `berita.tsx` — list + filter by kategori, pagination
- [ ] `berita/$slug.tsx` — **halaman detail berita (BARU)**
- [ ] `kegiatan.tsx` — list events, filter upcoming vs past
- [ ] `struktur.tsx` — live officers data
- [ ] `riwayat.tsx` — live past officers
- [ ] `galeri.tsx` — masonry grid dari collection
- [ ] `press-kit.tsx` — download langsung dari PocketBase file URL
- [ ] `kontak.tsx` — POST ke collection `contacts`

### 2.3 Fitur Tambahan Public Site
- [ ] **Search global** — cari di news + events via PocketBase filter API
- [ ] **RSS Feed** — `/rss.xml` untuk berita (via TanStack Start server route)
- [ ] **Sitemap** — `/sitemap.xml` auto-generate
- [ ] **OG Image dinamis** — per halaman berita (via canvas atau satori)
- [ ] **Pagination** — berita dan galeri
- [ ] **Share button** — per artikel (Web Share API)
- [ ] **Print-friendly** — halaman berita bisa di-print/save PDF

---

## FASE 3 — Admin Dashboard
**Estimasi: 5–7 hari**

### 3.1 Auth Flow
- [ ] Halaman `/login` — form email + password
- [ ] PocketBase `authWithPassword()` + simpan token di cookie (SSR-safe)
- [ ] Route guard middleware — redirect ke `/login` jika tidak terauth
- [ ] Auto-refresh token
- [ ] Logout

### 3.2 Layout & Navigation Admin
- [ ] Sidebar navigasi dengan ikon (Lucide)
- [ ] Topbar: info user login + notifikasi + logout
- [ ] Responsive (collapse ke hamburger di mobile)
- [ ] Dark mode toggle

### 3.3 Modul CRUD

#### 📰 Manajemen Berita
- [ ] List berita — tabel dengan filter (published/draft), search, sort
- [ ] Buat/Edit berita — **rich text editor** (TipTap atau Quill)
- [ ] Upload cover image dengan preview
- [ ] Toggle published/draft
- [ ] Hapus dengan konfirmasi dialog
- [ ] **Bilingual editor** — tab ID / EN side-by-side

#### 📅 Manajemen Kegiatan
- [ ] List events dengan kalender view + list view
- [ ] Buat/Edit event — date picker, location, cover upload
- [ ] Tandai event sebagai "selesai"

#### 👥 Manajemen Struktur & Riwayat
- [ ] List pejabat (active + past)
- [ ] Buat/Edit pejabat — upload foto, rank, posisi, periode jabatan
- [ ] Drag-and-drop urutan tampilan

#### 🖼️ Manajemen Galeri
- [ ] Upload multiple foto sekaligus
- [ ] Edit caption bilingual
- [ ] Drag-and-drop reorder
- [ ] Hapus foto

#### 📦 Manajemen Press Kit
- [ ] Upload file (ZIP/PDF/MP4)
- [ ] Edit nama, ukuran, tipe
- [ ] Reorder drag-and-drop

#### 📬 Manajemen Pesan Masuk (Kontak)
- [ ] List pesan dari form kontak
- [ ] Tandai read/unread
- [ ] Reply via mailto link
- [ ] Badge notifikasi di sidebar (unread count)

#### ⚙️ Pengaturan Situs
- [ ] Edit konten statis: visi, misi, profil satuan
- [ ] Edit info kontak (email, telepon, alamat)
- [ ] Upload logo & favicon
- [ ] Pengaturan SEO default

### 3.4 Dashboard Home (Analytics)
- [ ] Widget: total berita, kegiatan, pesan masuk, pejabat aktif
- [ ] Grafik: kunjungan halaman (integrasi Plausible atau Umami — self-hosted)
- [ ] Aktivitas terbaru (berita terakhir dipublish, pesan terbaru)
- [ ] Quick actions: "Tulis Berita Baru", "Tambah Kegiatan"

---

## FASE 4 — Fitur Power-Up
**Estimasi: 5–7 hari**

### 4.1 Notifikasi Real-time
- [ ] PocketBase **SSE (Server-Sent Events)** untuk notifikasi admin
- [ ] Toast notifikasi saat ada pesan masuk baru
- [ ] Badge live update di sidebar

### 4.2 Media Manager
- [ ] Browser file terpusat untuk semua file yang diupload ke PocketBase
- [ ] Reuse file yang sudah ada (hindari duplikasi)
- [ ] Compress otomatis gambar sebelum upload (browser-side, `browser-image-compression`)

### 4.3 Audit Log
- [ ] Catat semua aksi admin: siapa, apa, kapan
- [ ] Halaman log di admin dashboard
- [ ] Implementasi via PocketBase hooks

### 4.4 Multi-Admin & Peran
- [ ] Role: `super_admin`, `editor`, `viewer`
- [ ] Editor: bisa buat/edit konten, tidak bisa hapus atau ubah pengaturan
- [ ] Viewer: read-only dashboard

### 4.5 Backup & Export
- [ ] Tombol backup database (download `pb_data/data.db`)
- [ ] Export berita ke PDF (per artikel)
- [ ] Export data kontak ke CSV

### 4.6 SEO & Performance
- [ ] **ISR (Incremental Static Regeneration)** — cache halaman publik, revalidate saat konten berubah
- [ ] **Image optimization** — serve WebP via PocketBase thumbs API (`?thumb=600x400`)
- [ ] **Bundle analysis** — `vite-bundle-visualizer`
- [ ] Lighthouse score target: ≥ 90 semua kategori

---

## FASE 5 — Deployment & Ops
**Estimasi: 2–3 hari**

### 5.1 Infrastruktur
- [ ] **Public Site** → Deploy ke Vercel / Cloudflare Pages
- [ ] **Admin** → Deploy ke Vercel (dengan env `VITE_PB_URL`)
- [ ] **PocketBase** → VPS (DigitalOcean/Hetzner) atau Railway
- [ ] Setup domain + HTTPS (Let's Encrypt)

### 5.2 CI/CD Pipeline
- [ ] GitHub Actions: test → build → deploy on merge to `main`
- [ ] Preview deployments untuk setiap PR (Vercel)
- [ ] Environment: `development`, `staging`, `production`

### 5.3 Monitoring
- [ ] **Uptime monitoring** — UptimeRobot (gratis)
- [ ] **Error tracking** — Sentry (sudah ada `lovable-error-reporting.ts`, upgrade ke Sentry)
- [ ] **Analytics** — Umami self-hosted (privacy-first, pasang di public site)
- [ ] **PocketBase health check** — endpoint `/api/health`

### 5.4 Backup Otomatis
- [ ] Cron job harian: backup `pb_data/` ke object storage (S3/R2)
- [ ] Retensi backup: 30 hari

---

## Prioritas & Timeline

| Fase | Durasi | Prioritas |
|---|---|---|
| Fase 0 — Restrukturisasi | 1–2 hari | 🔴 CRITICAL |
| Fase 1 — Database & Backend | 2–3 hari | 🔴 CRITICAL |
| Fase 2 — Public Site Live | 3–4 hari | 🔴 HIGH |
| Fase 3 — Admin Dashboard | 5–7 hari | 🟡 HIGH |
| Fase 4 — Power Features | 5–7 hari | 🟢 MEDIUM |
| Fase 5 — Deploy & Ops | 2–3 hari | 🟡 HIGH |
| **TOTAL** | **~3–4 minggu** | |

---

## Quick Wins (Bisa Langsung Dikerjakan)

1. **Fix nav desktop** — hapus `.slice(0, 7)` di `site-header.tsx` → semua 9 nav item muncul
2. **Aktifkan form kontak** — sambungkan ke PocketBase collection `contacts` (1–2 jam)
3. **Halaman detail berita** — buat route `berita/$slug.tsx` (saat ini semua link berita ke list page)
4. **Fix i18n di halaman admin** — admin bisa full English saja, tidak perlu bilingual

---

## Dependensi Baru yang Perlu Diinstall

```jsonc
// packages/shared & apps/*
"pocketbase": "^0.21.0",          // PocketBase JS SDK

// apps/admin
"@tiptap/react": "^2.x",           // Rich text editor
"@tiptap/starter-kit": "^2.x",
"browser-image-compression": "^2.x", // Compress sebelum upload
"@tanstack/react-table": "^8.x",   // Tabel data admin
"recharts": "^2.x",                // Sudah ada, untuk grafik dashboard

// backend (pb_hooks - vanilla JS)
// tidak ada npm, PocketBase hooks pakai JSVM built-in
```

---

*Generated: Juni 2026 · command-connect · github.com/faturizki/command-connect*
