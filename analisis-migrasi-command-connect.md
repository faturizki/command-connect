# Analisis Mendalam Codebase & Rencana Migrasi
# `command-connect` → Cloudflare Pages + Supabase + R2

---

## 1. Gambaran Arsitektur Saat Ini

### Struktur Monorepo
```
command-connect/
├── apps/
│   ├── public-site/        ← Situs publik (SSR via TanStack Start)
│   └── admin/              ← Panel admin (SPA murni, Vite)
├── packages/
│   └── shared/
│       ├── pb.ts           ← Semua fungsi API (PocketBase client)
│       └── types.ts        ← Shared TypeScript types
├── backend/
│   ├── pb_migrations/      ← Migrasi PocketBase (KOSONG/placeholder)
│   └── pb_hooks/           ← PocketBase server hooks
└── src/components/         ← Komponen shared level root (minimal)
```

### Tech Stack Aktif
| Layer | Teknologi |
|-------|-----------|
| Frontend Public | TanStack Start (SSR) + React 19 + TailwindCSS v4 |
| Frontend Admin | Vite + React 19 + TailwindCSS v4 (SPA murni) |
| UI Components | Radix UI + shadcn/ui |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query |
| Backend | **PocketBase** (self-hosted Go binary) |
| Database | SQLite (embedded dalam PocketBase) |
| Storage | PocketBase built-in file storage |
| Build Tool | Vite 7 + Bun |
| Deploy Target | **Cloudflare** (sudah dikonfigurasi di `@lovable.dev/vite-tanstack-config`) |

---

## 2. Analisis Komponen Per-File

### `packages/shared/pb.ts` — Inti Masalah Migrasi
File ini adalah **single point of coupling** ke PocketBase. Semua fungsi API
memanggil `client.collection("x").getList/create/update/delete`. Ini yang
harus **diganti seluruhnya** ke Supabase client.

**Collections yang digunakan:**
- `news` — artikel berita (fields: title, excerpt, body, cover, category, date, published, slug)
- `events` — kegiatan (fields: title, excerpt, date, location, cover, category, finished)
- `officers` — pejabat/struktur komando (fields: rankCode, rank, name, position, photo, status, termStart, termEnd, bio, order)
- `gallery` — galeri foto (fields: image, caption, takenAt, order)
- `press_kit` — press kit (fields: name, fileAsset, sizeLabel, type, order)
- `contacts` — pesan kontak (fields: name, org, email, message, status)
- `settings` — pengaturan situs (fields: key, value)

**Pattern data unik:** Semua konten menggunakan `LocalizedText { id: string; en: string }`
→ kolom JSONB di Supabase atau kolom ganda `_id` / `_en`.

### `apps/public-site/` — SSR App (TanStack Start)
- **Kritis:** Menggunakan `createServerFn` dari TanStack Start → berjalan sebagai
  **Cloudflare Worker** (bukan Pages Function terpisah). Ini sudah benar.
- `src/server.ts` menangani `/rss.xml` dan `/sitemap.xml` langsung
- `src/lib/config.server.ts` sudah siap untuk environment Cloudflare Workers
  (membaca `process.env` di dalam fungsi, bukan di module scope)
- **SSR berjalan di Cloudflare Workers** — file asset statis di Pages, Worker
  menangani server rendering. Ini arsitektur **Cloudflare Pages + Functions**.

### `apps/admin/` — SPA Murni
- **Tidak ada SSR** — Vite build biasa menghasilkan file statis
- Memanggil PocketBase langsung dari browser
- Akan deploy sebagai **Cloudflare Pages** di domain terpisah (domain ke-2)
- Authentication: menggunakan `getPocketBaseClient()` → perlu diganti ke
  Supabase Auth

### `apps/admin/src/App.tsx` — Admin Panel (66KB!)
- Satu file monolitik berisi semua section admin
- Sections: dashboard, berita, kegiatan, struktur, galeri, presskit, kontak, settings
- File upload menggunakan PocketBase FormData → perlu diganti ke Supabase Storage + R2

---

## 3. Rencana Migrasi Stack

### Target Arsitektur
```
Domain 1 (situs.id)          Domain 2 (admin.situs.id tidak → admin-situs.id)
┌─────────────────────────┐   ┌─────────────────────────┐
│  Cloudflare Pages       │   │  Cloudflare Pages       │
│  apps/public-site       │   │  apps/admin             │
│  (SSR via CF Workers)   │   │  (SPA statis)           │
└──────────┬──────────────┘   └──────────┬──────────────┘
           │                             │
           └──────────────┬──────────────┘
                          ▼
              ┌───────────────────────┐
              │      Supabase         │
              │  ┌─────────────────┐  │
              │  │  PostgreSQL DB  │  │
              │  │  Auth (JWT)     │  │
              │  │  Edge Functions │  │
              │  │  Realtime       │  │
              │  └─────────────────┘  │
              └───────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   Cloudflare R2       │
              │  (foto, file assets,  │
              │   press kit, cover)   │
              └───────────────────────┘
```

---

## 4. Schema Database Supabase (PostgreSQL)

Semua tipe JSONB untuk `LocalizedText`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Localized text helper type (gunakan JSONB)
-- Format: {"id": "teks bahasa indonesia", "en": "english text"}

-- ─── NEWS ─────────────────────────────────────────────────────────────────
create table news (
  id          uuid primary key default uuid_generate_v4(),
  title       jsonb not null default '{"id":"","en":""}',
  excerpt     jsonb not null default '{"id":"","en":""}',
  body        jsonb not null default '{"id":"","en":""}',
  cover       text,             -- R2 object key atau URL publik
  category    jsonb not null default '{"id":"","en":""}',
  date        date not null,
  published   boolean not null default false,
  slug        text unique,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index idx_news_published_date on news (published, date desc);
create index idx_news_slug on news (slug);

-- ─── EVENTS ───────────────────────────────────────────────────────────────
create table events (
  id          uuid primary key default uuid_generate_v4(),
  title       jsonb not null default '{"id":"","en":""}',
  excerpt     jsonb not null default '{"id":"","en":""}',
  date        timestamptz not null,
  location    jsonb not null default '{"id":"","en":""}',
  cover       text,
  category    jsonb not null default '{"id":"","en":""}',
  finished    boolean not null default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index idx_events_date on events (date);

-- ─── OFFICERS ─────────────────────────────────────────────────────────────
create table officers (
  id          uuid primary key default uuid_generate_v4(),
  rank_code   text not null,
  rank        jsonb not null default '{"code":"","name":{"id":"","en":""}}',
  name        text not null,
  position    jsonb not null default '{"name":{"id":"","en":""},"division":{"id":"","en":""}}',
  photo       text,             -- R2 object key
  status      text not null check (status in ('active', 'past')),
  term_start  text,
  term_end    text,
  bio         jsonb default '{"id":"","en":""}',
  "order"     integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index idx_officers_status_order on officers (status, "order");

-- ─── GALLERY ──────────────────────────────────────────────────────────────
create table gallery (
  id          uuid primary key default uuid_generate_v4(),
  image       text not null,    -- R2 object key
  caption     jsonb not null default '{"id":"","en":""}',
  taken_at    date,
  "order"     integer default 0,
  created_at  timestamptz default now()
);

-- ─── PRESS KIT ────────────────────────────────────────────────────────────
create table press_kit (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  file_asset  text not null,    -- R2 object key
  size_label  text,
  type        text,
  "order"     integer default 0,
  created_at  timestamptz default now()
);

-- ─── CONTACTS ─────────────────────────────────────────────────────────────
create table contacts (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  org         text,
  email       text not null,
  message     text not null,
  status      text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at  timestamptz default now()
);
create index idx_contacts_status on contacts (status, created_at desc);

-- ─── SETTINGS ─────────────────────────────────────────────────────────────
create table settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text unique not null,
  value       jsonb not null default '{}'
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────
-- Public read untuk konten publik
alter table news enable row level security;
alter table events enable row level security;
alter table officers enable row level security;
alter table gallery enable row level security;
alter table press_kit enable row level security;
alter table contacts enable row level security;
alter table settings enable row level security;

-- Policy: siapa pun bisa baca news yang published
create policy "public can read published news"
  on news for select using (published = true);

-- Policy: admin bisa semua (gunakan service_role key di server functions)
-- Untuk admin panel, gunakan Supabase Auth + service role key
-- JANGAN expose service role key ke browser admin panel
-- Gunakan Supabase Edge Function sebagai proxy, atau
-- gunakan anon key + RLS policy berbasis auth.uid()

-- Public read untuk tabel lain
create policy "public can read events" on events for select using (true);
create policy "public can read officers" on officers for select using (true);
create policy "public can read gallery" on gallery for select using (true);
create policy "public can read press_kit" on press_kit for select using (true);
create policy "public can read settings" on settings for select using (true);

-- Contacts: siapa pun bisa insert
create policy "anyone can submit contact" on contacts for insert with check (true);
```

---

## 5. Migrasi `packages/shared/pb.ts` → `supabase.ts`

Ganti seluruh file `packages/shared/pb.ts` dengan implementasi Supabase:

```typescript
// packages/shared/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type {
  Lang, NewsArticle, EventItem, Officer,
  GalleryItem, PressKitItem, ContactMessage,
  SettingRecord, SearchResults
} from "./types";

// Gunakan VITE_ prefix untuk public vars (url, anon key)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── NEWS ─────────────────────────────────────────────────────────────────
export async function getNews(lang: Lang, page = 1, perPage = 10, category?: string) {
  let query = supabase
    .from("news")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("date", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  // Supabase JSONB filter untuk category
  if (category) {
    query = query.contains("category", { id: category });
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { items: data as NewsArticle[], totalItems: count ?? 0, page, perPage };
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data as NewsArticle;
}

export async function createNews(article: Omit<NewsArticle, "id">) {
  const { data, error } = await supabase.from("news").insert(article).select().single();
  if (error) throw error;
  return data;
}

// ... (pola sama untuk update/delete/admin list)

// ─── SEARCH ───────────────────────────────────────────────────────────────
// PocketBase search → Supabase full-text search (PostgreSQL)
export async function searchContent(query: string, lang: Lang): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) return { news: [], events: [] };

  // Supabase full-text search via JSONB text operator
  const [newsResult, eventsResult] = await Promise.all([
    supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .or(`title->>id.ilike.%${trimmed}%,title->>en.ilike.%${trimmed}%,excerpt->>id.ilike.%${trimmed}%`)
      .limit(20),
    supabase
      .from("events")
      .select("*")
      .or(`title->>id.ilike.%${trimmed}%,title->>en.ilike.%${trimmed}%`)
      .limit(20),
  ]);

  return {
    news: (newsResult.data ?? []) as NewsArticle[],
    events: (eventsResult.data ?? []) as EventItem[],
  };
}

// ─── CONTACT ──────────────────────────────────────────────────────────────
export async function submitContact(contact: Omit<ContactMessage, "status" | "createdAt">) {
  const { error } = await supabase.from("contacts").insert({ ...contact, status: "new" });
  if (error) throw error;
}
```

---

## 6. Storage: PocketBase → Cloudflare R2

### Strategi Upload (Admin Panel)
Saat ini admin panel upload file langsung ke PocketBase melalui FormData.
Dengan R2, ada 2 opsi:

**Opsi A (Recommended): Presigned URL via Supabase Edge Function**
```
Admin Browser → [POST /upload-url] → Edge Function → R2 Presigned PUT URL
Admin Browser → [PUT presigned URL] → R2 langsung (tidak lewat server)
Admin Panel menyimpan R2 key ke Supabase
```

**Opsi B: Upload via Cloudflare Worker Proxy**
```
Admin Browser → Cloudflare Worker → R2.put(key, body) → simpan key ke Supabase
```

### Mengakses File R2 dari Situs Publik
```typescript
// Buat helper untuk generate URL publik R2
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL; // e.g. https://cdn.situs.id

export function getAssetUrl(key: string | null | undefined): string {
  if (!key) return "/placeholder.jpg";
  if (key.startsWith("http")) return key; // URL eksternal
  return `${R2_PUBLIC_URL}/${key}`;       // R2 asset
}

// Penggunaan di komponen:
// <img src={getAssetUrl(officer.photo)} />
```

### Konfigurasi R2 Bucket
- Buat bucket: `command-connect-assets`
- Enable **Public Access** untuk bucket (atau gunakan Custom Domain R2)
- Set CORS policy untuk allow upload dari domain admin

---

## 7. Authentication Admin Panel

PocketBase punya auth bawaan. Supabase menggunakan Auth terpisah.

```typescript
// apps/admin/src/lib/auth.ts
import { supabase } from "@shared/supabase";

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function useSession() {
  // Gunakan onAuthStateChange di App.tsx
}
```

**Untuk RLS Admin:** Buat user admin di Supabase Auth Dashboard, lalu tambah policy:
```sql
-- Admin bisa semua operasi jika auth.email() = admin email
create policy "admin full access"
  on news for all
  using (auth.email() = 'admin@example.com')
  with check (auth.email() = 'admin@example.com');
```
Atau gunakan custom role via `user_metadata`.

---

## 8. Environment Variables

### `apps/public-site/.env` (Cloudflare Pages → Settings → Environment Variables)
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_R2_PUBLIC_URL=https://cdn.situs.id
VITE_APP_URL=https://situs.id
```

### `apps/admin/.env` (Cloudflare Pages domain ke-2)
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_R2_PUBLIC_URL=https://cdn.situs.id
# Untuk admin, R2 upload key disimpan di Edge Function (tidak di env browser)
```

---

## 9. Deploy: 2 Domain di Cloudflare Pages

### Domain 1 — Situs Publik (`situs.id`)
```
Cloudflare Pages Project: command-connect-public
├── Build command:    npm run build           (dari root)
├── Build output dir: apps/public-site/.output/public
├── Root directory:   (kosong, root monorepo)
└── Custom domain:    situs.id
```

**PENTING — SSR di Cloudflare Pages:**
TanStack Start + Cloudflare menghasilkan `.output/` folder dengan:
- `.output/public/` → aset statis (di-serve oleh Pages CDN)
- `.output/server/` → Worker script (dijalankan sebagai Pages Function `_worker.js`)

Tidak perlu konfigurasi tambahan — Cloudflare Pages otomatis mendeteksi
`_worker.js` di output folder.

### Domain 2 — Admin Panel (`admin-situs.id`)
```
Cloudflare Pages Project: command-connect-admin
├── Build command:    npm run build:admin     (dari root)
├── Build output dir: apps/admin/dist
├── Root directory:   (kosong, root monorepo)
└── Custom domain:    admin-situs.id
```

Admin adalah **SPA statis** — tidak ada Worker, hanya file HTML/JS/CSS.
Tambahkan `_redirects` file untuk handle SPA routing:
```
/* /index.html 200
```
Letakkan di `apps/admin/public/_redirects`.

---

## 10. Dependency yang Perlu Ditambah / Dihapus

### Tambah
```bash
# Supabase client
npm install @supabase/supabase-js

# R2 upload (browser-side, pakai fetch langsung ke presigned URL)
# Tidak perlu library tambahan
```

### Hapus / Ganti
```bash
# Hapus PocketBase client
npm uninstall pocketbase

# Hapus dari packages/shared/pb.ts → ganti jadi supabase.ts
```

---

## 11. Peta Perubahan File

| File | Aksi | Catatan |
|------|------|---------|
| `packages/shared/pb.ts` | **REPLACE** | Ganti semua dengan Supabase client |
| `packages/shared/types.ts` | **MINIMAL CHANGE** | Rename snake_case fields (e.g. `rank_code`) |
| `apps/public-site/src/lib/config.server.ts` | **UPDATE** | Tambah Supabase service role key untuk server-only ops |
| `apps/public-site/src/server.ts` | **NO CHANGE** | Sudah siap Cloudflare |
| `apps/admin/src/App.tsx` | **MAJOR REFACTOR** | Ganti semua PB calls + tambah Supabase Auth UI |
| `apps/admin/public/_redirects` | **CREATE** | SPA fallback routing |
| `packages/shared/supabase.ts` | **CREATE** | File baru pengganti pb.ts |
| `packages/shared/r2.ts` | **CREATE** | Helper untuk R2 asset URLs |
| `backend/` | **DELETE** | Tidak dipakai, ganti dengan Supabase |

---

## 12. Urutan Pengerjaan (Rekomendasi)

1. **Setup Supabase** — buat project, jalankan SQL schema di atas
2. **Konfigurasi R2** — buat bucket, set public access, custom domain CDN
3. **Buat `packages/shared/supabase.ts`** — port semua fungsi dari `pb.ts`
4. **Update `packages/shared/types.ts`** — sesuaikan field names (snake_case)
5. **Update public-site** — ganti import `@shared/pb` → `@shared/supabase`
6. **Refactor admin** — ganti PB auth + calls, tambah file upload ke R2
7. **Setup Cloudflare Pages** — 2 project terpisah, set env vars
8. **Konfigurasi custom domain** — kedua domain di Cloudflare Pages
9. **Test SSR** — pastikan `_worker.js` ter-generate dan berjalan

---

## 13. Potensi Masalah & Solusi

| Masalah | Solusi |
|---------|--------|
| PocketBase `search:` parameter tidak ada di Supabase | Gunakan `.ilike()` atau PostgreSQL full-text search (`to_tsvector`) |
| `ListResult` format beda dengan Supabase response | Buat wrapper function yang menormalisasi ke format yang sama |
| File upload PocketBase pakai FormData otomatis | Supabase Storage atau R2 presigned URL perlu flow terpisah |
| Admin panel buka `VITE_PB_URL` di module scope | Sudah aman karena Supabase URL bisa public (VITE_ prefix) |
| SSR: `process.env` vs Cloudflare `env` bindings | `config.server.ts` sudah handle ini dengan benar |
| CORS R2 bucket untuk upload dari admin domain | Set CORS di R2 bucket settings untuk `admin-situs.id` |
| TanStack Start belum support Cloudflare R2 bindings | Akses R2 dari browser via presigned URL, bukan Worker bindings |
