# MASTER MIGRATION PROMPT — command-connect
# Paste seluruh blok ini ke GitHub Copilot Chat di Codespace

---

## KONTEKS PROYEK

Saya punya monorepo `command-connect` dengan struktur:
```
command-connect/
├── apps/
│   ├── public-site/     ← TanStack Start SSR, deploy ke Cloudflare Pages (domain 1)
│   └── admin/           ← Vite SPA murni, deploy ke Cloudflare Pages (domain 2)
├── packages/
│   └── shared/
│       ├── pb.ts        ← SEMUA API calls ke PocketBase (AKAN DIHAPUS)
│       └── types.ts     ← Shared TypeScript types
└── backend/             ← PocketBase scaffold (AKAN DIHAPUS)
```

## TUJUAN MIGRASI

Ganti stack backend dari **PocketBase** ke:
- **Supabase** (PostgreSQL + Auth + Edge Functions) sebagai backend & database
- **Cloudflare R2** sebagai object storage (foto, file assets, press kit)
- **Cloudflare Pages** untuk deploy kedua app di 2 domain berbeda (bukan subdomain)

---

## INSTRUKSI UNTUK COPILOT

Lakukan migrasi ini secara **bertahap dan berurutan**. Setiap tahap minta konfirmasi saya sebelum lanjut ke tahap berikutnya. Jangan skip tahap.

---

### TAHAP 1 — Install dependencies

Jalankan di root monorepo:
```bash
# Tambah Supabase client
npm install @supabase/supabase-js

# Hapus PocketBase
npm uninstall pocketbase
```

Lalu hapus folder `backend/` sepenuhnya karena tidak dipakai lagi.

---

### TAHAP 2 — Buat file `packages/shared/supabase.ts`

Buat file baru `packages/shared/supabase.ts` sebagai pengganti `pb.ts`.

Isi lengkapnya harus mencakup semua fungsi yang ada di `pb.ts` saat ini, dengan mapping berikut:

**Inisialisasi client:**
```typescript
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Mapping fungsi PocketBase → Supabase:**

| Fungsi lama (pb.ts) | Fungsi baru (supabase.ts) | Catatan |
|---|---|---|
| `client.collection("news").getList(page, perPage, { filter, sort })` | `supabase.from("news").select("*", {count:"exact"}).eq("published",true).order("date",{ascending:false}).range(...)` | Return format: `{ items, totalItems, page, perPage }` |
| `client.collection("news").getFirstListItem('slug="x"')` | `supabase.from("news").select("*").eq("slug", slug).single()` | |
| `client.collection("news").getFullList(200, {...})` | `supabase.from("news").select("*").eq("published",true).order("date",{ascending:false})` | |
| `client.collection("x").create(data)` | `supabase.from("x").insert(data).select().single()` | |
| `client.collection("x").update(id, data)` | `supabase.from("x").update(data).eq("id",id).select().single()` | |
| `client.collection("x").delete(id)` | `supabase.from("x").delete().eq("id",id)` | |
| `search:` parameter PocketBase | `.or('title->>id.ilike.%q%,title->>en.ilike.%q%,excerpt->>id.ilike.%q%')` | JSONB text search |
| `client.collection("contacts").create(...)` | `supabase.from("contacts").insert(...)` | |
| `client.collection("settings").getFirstListItem('key="x"')` | `supabase.from("settings").select("*").eq("key", key).single()` | |

**Semua collections yang harus di-cover:**
- `news` — getNews, getPublishedNewsFeed, getAllPublishedNews, getNewsAdminList, createNews, updateNews, deleteNews, getNewsBySlug
- `events` — getEvents, getEventsAdminList, createEvent, updateEvent, deleteEvent
- `officers` — getOfficers, getOfficersAdminList, createOfficer, updateOfficer, deleteOfficer
- `gallery` — getGallery, getGalleryAdminList, createGalleryItem, updateGalleryItem, deleteGalleryItem
- `press_kit` — getPressKit, getPressKitAdminList, createPressKitItem, updatePressKitItem, deletePressKitItem
- `contacts` — getContactMessages, markContactRead, submitContact
- `settings` — getSetting
- search — searchContent

**Tambahkan juga fungsi helper untuk Supabase Auth (dipakai admin):**
```typescript
export async function adminSignIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function adminSignOut() {
  return supabase.auth.signOut();
}
export function getSupabaseClient() {
  return supabase;
}
```

---

### TAHAP 3 — Buat file `packages/shared/r2.ts`

Buat helper untuk R2 asset URL:

```typescript
// packages/shared/r2.ts
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL ?? "";

/**
 * Konversi R2 object key menjadi URL publik yang bisa dipakai di <img src> dll.
 * Jika key sudah berupa URL lengkap (http/https), kembalikan apa adanya.
 * Jika null/undefined, kembalikan string kosong.
 */
export function getAssetUrl(key: string | null | undefined): string {
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Upload file ke R2 via presigned URL.
 * Presigned URL didapat dari Supabase Edge Function atau Cloudflare Worker.
 * @param file - File object dari <input type="file">
 * @param presignedUrl - URL PUT yang sudah di-sign dari server
 */
export async function uploadToR2(file: File, presignedUrl: string): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status} ${res.statusText}`);
}

/**
 * Minta presigned URL dari backend (Supabase Edge Function atau CF Worker).
 * Endpoint ini harus dibuat terpisah di server side.
 */
export async function getUploadPresignedUrl(
  filename: string,
  contentType: string,
  folder: string = "uploads"
): Promise<{ presignedUrl: string; objectKey: string }> {
  const res = await fetch("/api/r2-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType, folder }),
  });
  if (!res.ok) throw new Error("Failed to get presigned URL");
  return res.json();
}
```

---

### TAHAP 4 — Update `packages/shared/package.json`

Pastikan export dari shared package mencakup file baru:
```json
{
  "name": "@shared",
  "exports": {
    "./pb": "./pb.ts",
    "./supabase": "./supabase.ts",
    "./r2": "./r2.ts",
    "./types": "./types.ts"
  }
}
```
Pertahankan export `./pb` sementara proses migrasi, hapus setelah semua import sudah dipindah.

---

### TAHAP 5 — Update `packages/shared/types.ts`

Perbarui field names di TypeScript types agar sesuai dengan kolom PostgreSQL (snake_case).
Namun karena Supabase JS client mengembalikan camelCase jika dikonfigurasi, atau snake_case default,
**pilih pendekatan**: tetap gunakan camelCase di TypeScript + tambahkan `db: { schema: ... }` mapping,
ATAU sesuaikan semua field ke snake_case.

**Rekomendasi:** Gunakan Supabase `transformResponse` atau buat mapping di `supabase.ts`.
Untuk kesederhanaan, update `types.ts` dengan field snake_case dan update semua usage.

Perubahan field yang perlu disesuaikan:
- `Officer.rankCode` → `rank_code`
- `Officer.termStart` → `term_start`
- `Officer.termEnd` → `term_end`
- `GalleryItem.takenAt` → `taken_at`
- `PressKitItem.fileAsset` → `file_asset`
- `PressKitItem.sizeLabel` → `size_label`
- `ContactMessage.createdAt` → `created_at`
- `NewsArticle` semua field sudah snake_case-compatible kecuali tidak ada

---

### TAHAP 6 — Update semua import di `apps/public-site/`

Cari semua file yang mengimport dari `@shared/pb` dan ganti ke `@shared/supabase`:

```bash
# Temukan semua file yang masih pakai @shared/pb
grep -r "@shared/pb" apps/public-site/src/ --include="*.ts" --include="*.tsx" -l
```

Untuk setiap file yang ditemukan, ganti:
```typescript
// SEBELUM
import { getNews, getEvents, ... } from "@shared/pb";

// SESUDAH
import { getNews, getEvents, ... } from "@shared/supabase";
```

File yang pasti perlu diupdate:
- `apps/public-site/src/routes/index.tsx`
- `apps/public-site/src/routes/berita.tsx`
- `apps/public-site/src/routes/berita/$slug.tsx`
- `apps/public-site/src/routes/kegiatan.tsx`
- `apps/public-site/src/routes/galeri.tsx`
- `apps/public-site/src/routes/struktur.tsx`
- `apps/public-site/src/routes/riwayat.tsx`
- `apps/public-site/src/routes/press-kit.tsx`
- `apps/public-site/src/routes/kontak.tsx`
- `apps/public-site/src/routes/search.tsx`
- `apps/public-site/src/server.ts`

---

### TAHAP 7 — Update `apps/admin/src/App.tsx`

Ini adalah file terbesar (66KB). Lakukan perubahan berikut:

**7a. Ganti import:**
```typescript
// SEBELUM
import { createNews, updateNews, ..., getPocketBaseClient } from "@shared/pb";

// SESUDAH
import { createNews, updateNews, ..., getSupabaseClient, adminSignIn, adminSignOut } from "@shared/supabase";
import { getAssetUrl, getUploadPresignedUrl, uploadToR2 } from "@shared/r2";
```

**7b. Tambah state untuk auth:**
```typescript
const [session, setSession] = useState<any>(null);
const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  const client = getSupabaseClient();
  client.auth.getSession().then(({ data }) => {
    setSession(data.session);
    setAuthLoading(false);
  });
  const { data: { subscription } } = client.auth.onAuthStateChange((_, s) => setSession(s));
  return () => subscription.unsubscribe();
}, []);
```

**7c. Ganti PocketBase auth login:**
```typescript
// SEBELUM (PocketBase)
await getPocketBaseClient().admins.authWithPassword(email, password);

// SESUDAH (Supabase)
const { error } = await adminSignIn(email, password);
if (error) throw error;
```

**7d. Ganti semua file upload:**
```typescript
// SEBELUM (PocketBase FormData)
const formData = new FormData();
formData.append("cover", file);
formData.append("title", JSON.stringify(title));
await createNews({ ...article, cover: formData });

// SESUDAH (R2 presigned URL)
// 1. Upload file ke R2
const { presignedUrl, objectKey } = await getUploadPresignedUrl(
  file.name, file.type, "covers"
);
await uploadToR2(file, presignedUrl);
// 2. Simpan objectKey ke Supabase (bukan URL penuh)
await createNews({ ...article, cover: objectKey });
```

**7e. Ganti semua penggunaan `pb.files.getUrl()` atau URL konstruksi PocketBase:**
```typescript
// SEBELUM
const imageUrl = pb.files.getUrl(record, record.cover);

// SESUDAH
import { getAssetUrl } from "@shared/r2";
const imageUrl = getAssetUrl(record.cover);
```

**7f. Tambah guard login di render utama:**
```typescript
if (authLoading) return <div>Loading...</div>;
if (!session) return <LoginForm onLogin={...} />;
return <AdminDashboard />;
```

---

### TAHAP 8 — Tambah file konfigurasi Cloudflare Pages

**8a. Buat `apps/admin/public/_redirects`:**
```
/* /index.html 200
```

**8b. Buat `apps/public-site/wrangler.toml`** (opsional, untuk preview lokal):
```toml
name = "command-connect-public"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".output/public"

[vars]
VITE_APP_URL = "https://situs.id"
```

**8c. Buat `.env.example` di root:**
```env
# Public Site & Admin — set di Cloudflare Pages Dashboard
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_R2_PUBLIC_URL=https://cdn.situs.id
VITE_APP_URL=https://situs.id
```

---

### TAHAP 9 — Update `apps/public-site/src/lib/config.server.ts`

Tambah Supabase service role key untuk operasi server-only (RSS feed, sitemap):

```typescript
export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    // Service role key HANYA untuk server — JANGAN prefix VITE_
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    r2PublicUrl: process.env.VITE_R2_PUBLIC_URL,
    appUrl: process.env.VITE_APP_URL,
  };
}
```

---

### TAHAP 10 — Hapus file-file yang tidak lagi dipakai

Setelah semua import sudah dipindah ke `@shared/supabase`, hapus:
```bash
rm packages/shared/pb.ts
rm -rf backend/
```

Dan update `packages/shared/package.json` — hapus export `./pb`.

---

### TAHAP 11 — Verifikasi TypeScript

Jalankan TypeScript compiler untuk cek semua error:
```bash
npm run build 2>&1 | head -100
```

Perbaiki semua type error yang muncul, terutama:
1. Field name snake_case vs camelCase
2. Return type Supabase yang berbeda dengan PocketBase `ListResult<T>`
3. Null handling — Supabase mengembalikan `data | null`, PocketBase langsung throw

Buat wrapper type jika perlu:
```typescript
// packages/shared/supabase.ts
export type PagedResult<T> = {
  items: T[];
  totalItems: number;
  page: number;
  perPage: number;
};
```

---

### TAHAP 12 — Test build lokal

```bash
# Test public site build
npm run build

# Test admin build
npm run build:admin

# Preview public site (jika ada Wrangler)
npm run preview
```

---

## CATATAN PENTING UNTUK COPILOT

1. **Jangan ubah** `apps/public-site/src/server.ts` kecuali pada bagian import `@shared/pb` → `@shared/supabase`
2. **Jangan ubah** struktur routing TanStack Router — hanya update data fetching
3. **Pertahankan** semua `useQuery` dan `useMutation` dari TanStack Query — hanya ganti `queryFn`
4. **Jangan hapus** mock data di `apps/public-site/src/lib/mock-data.ts` — biarkan sebagai fallback development
5. Untuk setiap fungsi yang dimigrasi, **pertahankan signature yang sama** (nama fungsi, parameter) agar tidak perlu update banyak file
6. Jika ada field JSONB `LocalizedText`, akses di query Supabase menggunakan operator `->>'field'` untuk filter, tapi return sebagai object utuh

---

## SQL SCHEMA SUPABASE

Jalankan SQL ini di **Supabase Dashboard → SQL Editor** sebelum mulai coding:

```sql
create extension if not exists "uuid-ossp";

create table news (
  id          uuid primary key default uuid_generate_v4(),
  title       jsonb not null default '{"id":"","en":""}',
  excerpt     jsonb not null default '{"id":"","en":""}',
  body        jsonb not null default '{"id":"","en":""}',
  cover       text,
  category    jsonb not null default '{"id":"","en":""}',
  date        date not null,
  published   boolean not null default false,
  slug        text unique,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

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

create table officers (
  id          uuid primary key default uuid_generate_v4(),
  rank_code   text not null,
  rank        jsonb not null default '{"code":"","name":{"id":"","en":""}}',
  name        text not null,
  position    jsonb not null default '{"name":{"id":"","en":""},"division":{"id":"","en":""}}',
  photo       text,
  status      text not null check (status in ('active','past')),
  term_start  text,
  term_end    text,
  bio         jsonb default '{"id":"","en":""}',
  "order"     integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table gallery (
  id          uuid primary key default uuid_generate_v4(),
  image       text not null,
  caption     jsonb not null default '{"id":"","en":""}',
  taken_at    date,
  "order"     integer default 0,
  created_at  timestamptz default now()
);

create table press_kit (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  file_asset  text not null,
  size_label  text,
  type        text,
  "order"     integer default 0,
  created_at  timestamptz default now()
);

create table contacts (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  org         text,
  email       text not null,
  message     text not null,
  status      text not null default 'new' check (status in ('new','read','replied')),
  created_at  timestamptz default now()
);

create table settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text unique not null,
  value       jsonb not null default '{}'
);

-- Row Level Security
alter table news enable row level security;
alter table events enable row level security;
alter table officers enable row level security;
alter table gallery enable row level security;
alter table press_kit enable row level security;
alter table contacts enable row level security;
alter table settings enable row level security;

create policy "public read published news" on news for select using (published = true);
create policy "public read events" on events for select using (true);
create policy "public read officers" on officers for select using (true);
create policy "public read gallery" on gallery for select using (true);
create policy "public read press_kit" on press_kit for select using (true);
create policy "public read settings" on settings for select using (true);
create policy "anyone can submit contact" on contacts for insert with check (true);

-- Admin full access (ganti email sesuai admin Anda)
create policy "admin all news" on news for all using (auth.email() = 'admin@yourdomain.com') with check (auth.email() = 'admin@yourdomain.com');
create policy "admin all events" on events for all using (auth.email() = 'admin@yourdomain.com') with check (auth.email() = 'admin@yourdomain.com');
create policy "admin all officers" on officers for all using (auth.email() = 'admin@yourdomain.com') with check (auth.email() = 'admin@yourdomain.com');
create policy "admin all gallery" on gallery for all using (auth.email() = 'admin@yourdomain.com') with check (auth.email() = 'admin@yourdomain.com');
create policy "admin all press_kit" on press_kit for all using (auth.email() = 'admin@yourdomain.com') with check (auth.email() = 'admin@yourdomain.com');
create policy "admin read contacts" on contacts for select using (auth.email() = 'admin@yourdomain.com');
create policy "admin update contacts" on contacts for update using (auth.email() = 'admin@yourdomain.com');
create policy "admin all settings" on settings for all using (auth.email() = 'admin@yourdomain.com') with check (auth.email() = 'admin@yourdomain.com');
```

---

## MULAI DARI MANA?

Ketik: **"Mulai Tahap 1"** dan Copilot akan mengeksekusi satu per satu.
Setelah setiap tahap selesai, ketik **"Lanjut Tahap [N]"** untuk melanjutkan.
