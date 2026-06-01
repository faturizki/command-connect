# ARSITEKTUR MULTI-TENANT + COPILOT PROMPT
# command-connect → infopers.web.id & infopers.biz.id

---

## BAGIAN 1 — DESAIN ARSITEKTUR MULTI-TENANT

### Pola Tenant: Subdomain-based Row-Level Isolation

```
clienta.infopers.web.id  →  Cloudflare Pages (public-site)  →  Supabase [tenant_id = 'clienta']
clientb.infopers.web.id  →  Cloudflare Pages (public-site)  →  Supabase [tenant_id = 'clientb']

clienta.infopers.biz.id  →  Cloudflare Pages (admin)        →  Supabase [tenant_id = 'clienta']
clientb.infopers.biz.id  →  Cloudflare Pages (admin)        →  Supabase [tenant_id = 'clientb']
```

Satu Supabase project, semua tabel punya kolom `tenant_id`, RLS memfilter per tenant.

---

### Cara Kerja Resolusi Tenant

**Public Site (SSR — Cloudflare Worker):**
```
Request masuk → Worker membaca hostname → ekstrak subdomain
→ lookup tenant dari DB → inject tenant_id ke semua query
```

**Admin SPA (browser):**
```
Browser load → baca window.location.hostname → ekstrak subdomain
→ kirim ke Supabase sebagai filter di semua query
→ Auth: user Supabase hanya bisa akses tenant miliknya (RLS)
```

---

### Wildcard Domain di Cloudflare Pages

Cloudflare Pages mendukung wildcard custom domain `*.infopers.web.id` dan `*.infopers.biz.id`.
Satu Pages project melayani semua subdomain — tidak perlu deploy ulang per client.

```
CF Pages Project: infopers-public
  Custom domains:
    - infopers.web.id           (root domain → landing page)
    - *.infopers.web.id         (semua client)

CF Pages Project: infopers-admin
  Custom domains:
    - infopers.biz.id           (root → redirect ke login atau docs)
    - *.infopers.biz.id         (semua client admin)
```

---

### DNS Setup di Cloudflare

Untuk `infopers.web.id` (nameserver sudah di Cloudflare):
```
Type  Name                Value               Proxy
CNAME infopers.web.id     pages.dev alias     ✓ (proxied)
CNAME *.infopers.web.id   pages.dev alias     ✓ (proxied)
CNAME infopers.biz.id     pages.dev alias     ✓ (proxied)
CNAME *.infopers.biz.id   pages.dev alias     ✓ (proxied)
```
Cloudflare Pages akan handle routing dari wildcard CNAME ke project yang tepat.

---

## BAGIAN 2 — SCHEMA DATABASE MULTI-TENANT

### Tabel `tenants` (baru)
```sql
create table tenants (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,   -- 'clienta', 'clientb' — cocok dengan subdomain
  name         text not null,          -- 'Nama Satuan Client A'
  plan         text default 'free',    -- 'free', 'pro', dll
  active       boolean default true,
  created_at   timestamptz default now()
);

-- Seed: insert tenant pertama
insert into tenants (slug, name) values ('demo', 'Demo Satuan');
```

### Update Semua Tabel — Tambah `tenant_id`
```sql
-- Jalankan untuk setiap tabel: news, events, officers, gallery, press_kit, contacts, settings

alter table news       add column tenant_id uuid references tenants(id) on delete cascade;
alter table events     add column tenant_id uuid references tenants(id) on delete cascade;
alter table officers   add column tenant_id uuid references tenants(id) on delete cascade;
alter table gallery    add column tenant_id uuid references tenants(id) on delete cascade;
alter table press_kit  add column tenant_id uuid references tenants(id) on delete cascade;
alter table contacts   add column tenant_id uuid references tenants(id) on delete cascade;
alter table settings   add column tenant_id uuid references tenants(id) on delete cascade;

-- Index untuk performa query per tenant
create index idx_news_tenant       on news       (tenant_id, published, date desc);
create index idx_events_tenant     on events     (tenant_id, date);
create index idx_officers_tenant   on officers   (tenant_id, status, "order");
create index idx_gallery_tenant    on gallery    (tenant_id, "order");
create index idx_press_kit_tenant  on press_kit  (tenant_id, "order");
create index idx_contacts_tenant   on contacts   (tenant_id, created_at desc);
create index idx_settings_tenant   on settings   (tenant_id, key);
```

### Tabel `tenant_users` — mapping user ke tenant
```sql
create table tenant_users (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid references tenants(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  role        text default 'admin' check (role in ('admin', 'editor', 'viewer')),
  created_at  timestamptz default now(),
  unique (tenant_id, user_id)
);
```

### Row Level Security — Tenant Isolation
```sql
-- Helper function: ambil tenant_id dari user yang sedang login
create or replace function current_tenant_id()
returns uuid as $$
  select tenant_id from tenant_users
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- Drop policy lama, buat ulang dengan tenant filter
-- NEWS
drop policy if exists "public read published news" on news;
drop policy if exists "admin all news" on news;

create policy "tenant: public read published news"
  on news for select
  using (published = true and tenant_id = current_tenant_id());

-- Untuk public site yang belum login (anonymous), perlu bypass RLS via service key
-- Gunakan Supabase Edge Function sebagai proxy untuk public queries

create policy "tenant: admin full access news"
  on news for all
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

-- Ulangi pola yang sama untuk events, officers, gallery, press_kit, settings
-- contacts: siapa pun bisa insert ke tenant yang tepat
create policy "tenant: public insert contact"
  on contacts for insert
  with check (tenant_id = (select id from tenants where slug = current_setting('app.tenant_slug', true)));

create policy "tenant: admin read contacts"
  on contacts for select
  using (tenant_id = current_tenant_id());
```

### RLS untuk Public (anonymous) — via `app.tenant_slug` setting
```sql
-- Public site membaca data tanpa login — gunakan pola set_config
-- Di Supabase Edge Function atau server function:
-- set local "app.tenant_slug" = 'clienta';
-- Lalu query berjalan dengan filter tenant otomatis

create policy "tenant: anon read published news"
  on news for select
  using (
    published = true
    and tenant_id = (
      select id from tenants
      where slug = current_setting('app.tenant_slug', true)
        and active = true
    )
  );
```

---

## BAGIAN 3 — IMPLEMENTASI KODE

### `packages/shared/tenant.ts` (file baru)
```typescript
/**
 * Ekstrak tenant slug dari hostname.
 * clienta.infopers.web.id → 'clienta'
 * infopers.web.id          → null (root domain)
 * localhost:5173            → 'demo' (dev fallback)
 */
export function getTenantSlug(hostname: string): string | null {
  // Dev fallback
  if (hostname.startsWith('localhost') || hostname.startsWith('127.')) {
    return import.meta.env.VITE_DEV_TENANT ?? 'demo';
  }

  const knownRoots = [
    'infopers.web.id',
    'infopers.biz.id',
    // tambah domain lain di sini
  ];

  for (const root of knownRoots) {
    if (hostname === root) return null; // root domain, bukan tenant
    if (hostname.endsWith(`.${root}`)) {
      const sub = hostname.slice(0, -(root.length + 1));
      // Pastikan bukan double subdomain (a.b.infopers.web.id)
      if (!sub.includes('.')) return sub;
    }
  }
  return null;
}

/**
 * Untuk dipakai di browser (admin SPA dan client-side public site)
 */
export function getCurrentTenantSlug(): string {
  if (typeof window === 'undefined') return 'demo';
  return getTenantSlug(window.location.hostname) ?? 'root';
}
```

### Update `packages/shared/supabase.ts` — Inject Tenant

Semua fungsi query harus menerima atau auto-detect `tenantSlug`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { getCurrentTenantSlug } from "./tenant";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: ambil tenant_id dari slug (di-cache di memory)
const tenantCache = new Map<string, string>();

export async function getTenantId(slug: string): Promise<string> {
  if (tenantCache.has(slug)) return tenantCache.get(slug)!;
  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  if (error || !data) throw new Error(`Tenant '${slug}' not found`);
  tenantCache.set(slug, data.id);
  return data.id;
}

// Semua query public menggunakan tenant_id
export async function getNews(lang: Lang, page = 1, perPage = 10, category?: string) {
  const tenantSlug = getCurrentTenantSlug();
  const tenantId = await getTenantId(tenantSlug);

  let query = supabase
    .from('news')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .eq('tenant_id', tenantId)          // ← filter tenant
    .order('date', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (category) query = query.contains('category', { id: category });

  const { data, count, error } = await query;
  if (error) throw error;
  return { items: data as NewsArticle[], totalItems: count ?? 0, page, perPage };
}

// Pola yang sama untuk semua fungsi lain
// createNews, createEvent, dll → inject tenant_id otomatis:
export async function createNews(article: Omit<NewsArticle, 'id'>) {
  const tenantSlug = getCurrentTenantSlug();
  const tenantId = await getTenantId(tenantSlug);

  const { data, error } = await supabase
    .from('news')
    .insert({ ...article, tenant_id: tenantId })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

### Update `apps/public-site/src/lib/config.server.ts` — Tenant dari Request

```typescript
import process from "node:process";
import { getTenantSlug } from "@shared/tenant";

export function getServerConfig() {
  return {
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    r2PublicUrl: process.env.VITE_R2_PUBLIC_URL,
    appUrl: process.env.VITE_APP_URL,
  };
}

/**
 * Ekstrak tenant dari request hostname (untuk SSR/Worker).
 * Dipanggil di dalam handler, bukan module scope.
 */
export function getTenantFromRequest(request: Request): string {
  const hostname = new URL(request.url).hostname;
  return getTenantSlug(hostname) ?? 'demo';
}
```

### Update `apps/public-site/src/server.ts` — Tenant-aware RSS & Sitemap

```typescript
// Di handleRss dan handleSitemap, ekstrak tenant dari request
import { getTenantFromRequest } from "./lib/config.server";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const tenantSlug = getTenantFromRequest(request);

    if (url.pathname === "/rss.xml") {
      return await handleRss(tenantSlug);
    }
    if (url.pathname === "/sitemap.xml") {
      return await handleSitemap(tenantSlug, SITE_URL);
    }
    // ... rest sama
  }
};

async function handleRss(tenantSlug: string) {
  // getPublishedNewsFeed sudah auto-detect tenant via getCurrentTenantSlug
  // tapi di server harus override dengan slug dari request
  // → perlu versi fungsi yang terima explicit tenantSlug
}
```

### Tambah versi fungsi dengan explicit tenantSlug (untuk SSR)

```typescript
// packages/shared/supabase.ts — tambahkan overload

export async function getNewsByTenant(
  tenantSlug: string,
  lang: Lang,
  page = 1,
  perPage = 10
) {
  const tenantId = await getTenantId(tenantSlug);
  // ... query dengan tenantId eksplisit
}
```

---

## BAGIAN 4 — R2 STORAGE MULTI-TENANT

Struktur folder di R2 bucket per tenant:
```
command-connect-assets/
├── clienta/
│   ├── covers/
│   │   └── news-cover-uuid.jpg
│   ├── photos/
│   │   └── officer-photo-uuid.jpg
│   └── presskit/
│       └── document-uuid.pdf
├── clientb/
│   ├── covers/
│   └── photos/
```

Update `packages/shared/r2.ts`:
```typescript
export async function getUploadPresignedUrl(
  filename: string,
  contentType: string,
  folder: string = 'uploads',
  tenantSlug?: string                    // ← tambah parameter tenant
): Promise<{ presignedUrl: string; objectKey: string }> {
  const slug = tenantSlug ?? getCurrentTenantSlug();
  const res = await fetch('/api/r2-presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename,
      contentType,
      folder: `${slug}/${folder}`,       // ← prefix dengan tenant slug
    }),
  });
  if (!res.ok) throw new Error('Failed to get presigned URL');
  return res.json();
}
```

---

## BAGIAN 5 — ADMIN AUTH MULTI-TENANT

Admin login flow:
1. User buka `clienta.infopers.biz.id`
2. App baca subdomain → `tenantSlug = 'clienta'`
3. User login dengan Supabase Auth (email + password)
4. RLS check: user harus ada di `tenant_users` untuk tenant `clienta`
5. Jika tidak ada di tenant → tolak akses meski login berhasil

```typescript
// apps/admin/src/lib/auth.ts
import { supabase, getTenantId } from '@shared/supabase';
import { getCurrentTenantSlug } from '@shared/tenant';

export async function adminSignIn(email: string, password: string) {
  // 1. Login dulu
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // 2. Verifikasi user punya akses ke tenant ini
  const tenantSlug = getCurrentTenantSlug();
  const tenantId = await getTenantId(tenantSlug);

  const { data: access } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('tenant_id', tenantId)
    .eq('user_id', data.user.id)
    .single();

  if (!access) {
    await supabase.auth.signOut();
    throw new Error(`Akun ini tidak memiliki akses ke tenant '${tenantSlug}'`);
  }

  return { session: data.session, role: access.role };
}
```

---

## BAGIAN 6 — COPILOT PROMPT UNTUK IMPLEMENTASI MULTI-TENANT

Paste prompt di bawah ini ke GitHub Copilot Chat setelah migrasi Supabase selesai:

---

```
@workspace

## KONTEKS
Proyek command-connect sudah berhasil dimigrasi dari PocketBase ke Supabase.
Sekarang saya ingin mengimplementasikan arsitektur MULTI-TENANT berbasis subdomain.

Pola:
- clienta.infopers.web.id → public site untuk tenant 'clienta'
- clienta.infopers.biz.id → admin panel untuk tenant 'clienta'
- Satu Supabase project, semua data dipisah per tenant via kolom tenant_id + RLS

## TAHAP A — Buat packages/shared/tenant.ts

Buat file baru `packages/shared/tenant.ts` dengan fungsi:

1. `getTenantSlug(hostname: string): string | null`
   - Input: hostname dari request/browser
   - Logic: jika hostname adalah `sub.infopers.web.id` atau `sub.infopers.biz.id` → return 'sub'
   - Jika hostname adalah root domain atau tidak dikenal → return null
   - Jika localhost → return nilai VITE_DEV_TENANT env var atau 'demo'

2. `getCurrentTenantSlug(): string`
   - Baca dari window.location.hostname (browser)
   - Return 'demo' sebagai fallback jika tidak ada subdomain

3. Export constant `KNOWN_ROOT_DOMAINS = ['infopers.web.id', 'infopers.biz.id']`

## TAHAP B — Update packages/shared/supabase.ts

Update file `packages/shared/supabase.ts` yang sudah ada:

1. Import `getCurrentTenantSlug` dari `./tenant`

2. Tambah fungsi `getTenantId(slug: string): Promise<string>` dengan in-memory cache

3. Update SEMUA fungsi query (getNews, getEvents, getOfficers, getGallery, getPressKit, 
   getContactMessages, getSetting, searchContent) untuk:
   - Memanggil `getCurrentTenantSlug()` di awal
   - Memanggil `getTenantId(slug)` untuk dapat UUID
   - Menambahkan `.eq('tenant_id', tenantId)` ke semua query

4. Update SEMUA fungsi create (createNews, createEvent, createOfficer, createGalleryItem,
   createPressKitItem, submitContact) untuk auto-inject `tenant_id` dari current tenant

5. Tambahkan versi fungsi dengan explicit tenantSlug untuk SSR:
   - `getNewsByTenant(tenantSlug, lang, page, perPage)`
   - `getPublishedNewsFeedByTenant(tenantSlug, lang, limit)`
   - `getAllPublishedNewsByTenant(tenantSlug)`
   Versi ini dipakai di server.ts untuk RSS/sitemap

## TAHAP C — Update packages/shared/r2.ts

Update `getUploadPresignedUrl` untuk prefix folder dengan tenant slug:
- `folder` parameter menjadi `${tenantSlug}/${folder}`
- Auto-detect tenant dari `getCurrentTenantSlug()`

## TAHAP D — Update apps/public-site/src/lib/config.server.ts

Tambah fungsi `getTenantFromRequest(request: Request): string` yang:
- Baca hostname dari `new URL(request.url).hostname`
- Panggil `getTenantSlug(hostname)` dari `@shared/tenant`
- Return slug atau 'demo' sebagai fallback

## TAHAP E — Update apps/public-site/src/server.ts

Gunakan `getTenantFromRequest(request)` di handler RSS dan sitemap,
lalu pass tenantSlug ke fungsi `getPublishedNewsFeedByTenant` dan `getAllPublishedNewsByTenant`.

## TAHAP F — Buat apps/admin/src/lib/auth.ts

Buat file baru `apps/admin/src/lib/auth.ts` dengan:

1. `adminSignIn(email, password)`:
   - Login via supabase.auth.signInWithPassword
   - Setelah login, verifikasi user ada di tabel `tenant_users` untuk current tenant
   - Jika tidak ada akses, panggil signOut dan throw error "Tidak ada akses ke tenant ini"
   - Return: `{ session, role }`

2. `adminSignOut()`: supabase.auth.signOut()

3. `useAdminAuth()` hook:
   - State: `{ session, role, tenantId, loading }`
   - Effect: getSession + onAuthStateChange
   - Kalau session ada, fetch role dari tenant_users

## TAHAP G — Update apps/admin/src/App.tsx

1. Import dan gunakan `useAdminAuth` dari `./lib/auth`
2. Tampilkan komponen `<LoginPage tenantSlug={currentTenant} />` jika belum login
3. Setelah login berhasil, tampilkan dashboard seperti biasa
4. Di header/navbar admin, tampilkan nama tenant (getCurrentTenantSlug())

## TAHAP H — Update packages/shared/types.ts

Tambahkan tipe baru:
```typescript
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: string;
  active: boolean;
  created_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
}
```

## SQL YANG HARUS DIJALANKAN DI SUPABASE DASHBOARD SEBELUM CODING

```sql
-- Tabel tenants
create table tenants (
  id         uuid primary key default uuid_generate_v4(),
  slug       text unique not null,
  name       text not null,
  plan       text default 'free',
  active     boolean default true,
  created_at timestamptz default now()
);

-- Tabel tenant_users
create table tenant_users (
  id         uuid primary key default uuid_generate_v4(),
  tenant_id  uuid references tenants(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  role       text default 'admin' check (role in ('admin','editor','viewer')),
  created_at timestamptz default now(),
  unique (tenant_id, user_id)
);

-- Tambah kolom tenant_id ke semua tabel
alter table news       add column tenant_id uuid references tenants(id) on delete cascade;
alter table events     add column tenant_id uuid references tenants(id) on delete cascade;
alter table officers   add column tenant_id uuid references tenants(id) on delete cascade;
alter table gallery    add column tenant_id uuid references tenants(id) on delete cascade;
alter table press_kit  add column tenant_id uuid references tenants(id) on delete cascade;
alter table contacts   add column tenant_id uuid references tenants(id) on delete cascade;
alter table settings   add column tenant_id uuid references tenants(id) on delete cascade;

-- Index
create index idx_news_tenant     on news     (tenant_id, published, date desc);
create index idx_events_tenant   on events   (tenant_id, date);
create index idx_officers_tenant on officers (tenant_id, status, "order");
create index idx_gallery_tenant  on gallery  (tenant_id, "order");
create index idx_contacts_tenant on contacts (tenant_id, created_at desc);
create index idx_settings_tenant on settings (tenant_id, key);

-- Helper function untuk RLS
create or replace function current_tenant_id()
returns uuid as $$
  select tenant_id from tenant_users
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- Aktifkan RLS dengan tenant filter
alter table tenants    enable row level security;
alter table tenant_users enable row level security;

-- Tenant users hanya bisa lihat tenant mereka sendiri
create policy "user sees own tenants"
  on tenant_users for select
  using (user_id = auth.uid());

-- Insert tenant demo
insert into tenants (slug, name) values ('demo', 'Demo Satuan');
```

## CATATAN PENTING

1. Pertahankan semua nama fungsi yang sudah ada — hanya tambah logika tenant di dalamnya
2. Jangan ubah signature fungsi yang sudah dipakai di route files
3. `getTenantId()` harus di-cache agar tidak hit DB setiap request
4. Untuk dev lokal: baca `VITE_DEV_TENANT=demo` dari .env
5. Fungsi versi `ByTenant` untuk SSR menerima explicit slug, bukan dari window.location
6. Jangan lupa update .env.example dengan `VITE_DEV_TENANT=demo`

## URUTAN EKSEKUSI

Ketik "Mulai Tahap A" lalu konfirmasi tiap tahap sebelum lanjut.
```

---

## BAGIAN 7 — CHECKLIST MANUAL (BUKAN UNTUK COPILOT)

Hal-hal yang harus dilakukan manual di dashboard, bukan oleh Copilot:

### Supabase Dashboard
- [ ] Jalankan SQL schema di atas (SQL Editor)
- [ ] Buat tenant pertama: `insert into tenants (slug, name) values ('demo', 'Demo Satuan')`
- [ ] Buat user admin: Authentication → Users → Add User
- [ ] Link user ke tenant: `insert into tenant_users (tenant_id, user_id, role) values (...)`

### Cloudflare Dashboard
- [ ] DNS → Tambah record `CNAME * → <pages-project>.pages.dev` (proxied) untuk kedua domain
- [ ] Pages → Project public-site → Custom Domains → Tambah `*.infopers.web.id`
- [ ] Pages → Project admin → Custom Domains → Tambah `*.infopers.biz.id`
- [ ] R2 → Bucket `command-connect-assets` → Settings → Public Access: On
- [ ] R2 → Custom Domain: `cdn.infopers.web.id`

### Environment Variables di Cloudflare Pages
**Public Site project:**
```
VITE_SUPABASE_URL          = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY     = eyJ...
VITE_R2_PUBLIC_URL         = https://cdn.infopers.web.id
VITE_APP_URL               = https://infopers.web.id
SUPABASE_SERVICE_ROLE_KEY  = eyJ...  (encrypted, server-only)
```

**Admin project:**
```
VITE_SUPABASE_URL          = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY     = eyJ...
VITE_R2_PUBLIC_URL         = https://cdn.infopers.web.id
VITE_APP_URL               = https://infopers.biz.id
```

### .env Lokal untuk Development
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_R2_PUBLIC_URL=https://cdn.infopers.web.id
VITE_APP_URL=http://localhost:4173
VITE_DEV_TENANT=demo
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
