# Security & Stability Improvements

Dokumentasi ini menjelaskan perbaikan signifikan yang telah dilakukan untuk mengatasi masalah error handling, validasi input, rate limiting, dan konfigurasi lingkungan.

## Daftar Masalah yang Diperbaiki

### 1. ✅ Error Handling di Routes (Masalah #5)

**Masalah Awal:**
- 0 try/catch blocks ditemukan di `apps/public-site/src/routes/`
- Jika Supabase down atau query gagal, user akan melihat halaman putih/crash
- Error handling minimal dan tidak konsisten

**Solusi Implementasi:**

#### A. Error Handling Utility (`src/lib/error-handling.ts`)
- `withErrorHandling()`: Wrapper async function dengan error handling otomatis
- `handleSupabaseError()`: Mapping error codes Supabase ke pesan user-friendly (bilingual)
- `getErrorMessage()`: Ekstrak pesan error dari berbagai format
- `formatErrorLog()`: Format error log untuk debugging

#### B. Enhanced Error Boundaries
- Improved root error component di `__root.tsx`
- Error recovery dengan retry logic
- User-friendly error messages (Indonesian & English)

#### C. Improved Route Error Handling (Contoh: `berita.tsx`)
```typescript
// Sebelum:
const { data, isLoading, isError } = useQuery({...})

// Sesudah:
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["news", lang, page, category],
  queryFn: () => getNews(lang, page, perPage, category),
  retry: 3,  // Automatic retry
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})

// Dengan error display yang lebih baik dan tombol retry
{isError && (
  <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8">
    <div className="text-rose-500">
      <div className="font-semibold">Error message</div>
      <div className="mt-2 text-sm">{errorMessage}</div>
    </div>
    <button onClick={() => refetch()}>Try Again</button>
  </div>
)}
```

**File yang Dibuat/Dimodifikasi:**
- ✨ `apps/public-site/src/lib/error-handling.ts` (NEW)
- 📝 `apps/public-site/src/routes/berita.tsx` (IMPROVED)
- 📝 `apps/public-site/src/routes/__root.tsx` (EXISTING)

---

### 2. ✅ Rate Limiting Tidak Ada (Masalah #6)

**Masalah Awal:**
- Form kontak publik (`submitContact`) tidak memiliki rate limiting
- Rentan spam/abuse
- No protection against brute force attacks

**Solusi Implementasi:**

#### A. Rate Limiting Module (`packages/shared/rate-limit.ts`)
```typescript
// In-memory rate limiting dengan auto-cleanup
const rateLimitStore = new Map<string, RateLimitEntry>();

// Usage:
if (!checkRateLimit(clientIp)) {
  // Rate limited!
  return error(429, "Too many requests");
}

// Configuration via environment:
VITE_RATE_LIMIT_MAX_REQUESTS=5
VITE_RATE_LIMIT_WINDOW_MS=900000  // 15 minutes
```

**Features:**
- In-memory store (production: gunakan Redis)
- Auto-cleanup expired entries setiap 5 menit
- Configurable limits
- Get remaining attempts & reset time

#### B. Contact Form Rate Limiting
```typescript
// api/contact.post.ts
const clientIp = getClientIP(event);
const rateLimitKey = `contact:${clientIp}`;
if (!checkRateLimit(rateLimitKey)) {
  throw createError({
    statusCode: 429,
    statusMessage: "Too Many Requests",
    data: { retryAfter: status.resetTime },
  });
}
```

**File yang Dibuat:**
- ✨ `packages/shared/rate-limit.ts` (NEW)
- ✨ `apps/public-site/src/routes/api/contact.post.ts` (NEW)

---

### 3. ✅ Tidak Ada Validasi Input di Sisi Server (Masalah #7)

**Masalah Awal:**
- Semua validasi terjadi di client-side React only
- Tidak ada server-side validation sebelum data masuk ke Supabase
- Vulnerable terhadap bypass attacks (curl, Postman, dll)
- No sanitization of user input

**Solusi Implementasi:**

#### A. Server-Side Validation Module (`packages/shared/validation.ts`)
```typescript
// Comprehensive validation untuk contact messages
export function validateContactMessage(data: unknown): ValidationResult {
  // Validasi:
  // - name: 2-100 chars
  // - org: 2-150 chars
  // - email: format valid, max 255 chars
  // - message: 10-5000 chars
  
  return {
    isValid: errors.length === 0,
    errors: [...], // Array of field-specific errors
  };
}

// Helper functions:
- sanitizeString(value): XSS prevention
- isValidEmail(email): Email validation
- isValidLength(value, min, max): Length validation
```

#### B. API Endpoint dengan Validation
```typescript
// api/contact.post.ts
const validation = validateContactMessage(body);
if (!validation.isValid) {
  throw createError({
    statusCode: 400,
    statusMessage: "Bad Request",
    data: { errors: validation.errors },
  });
}
```

#### C. Updated Contact Form
- Still has client-side validation untuk UX
- Now sends to `/api/contact` endpoint (not direct Supabase)
- Server validates before database insert
- Better error messages dengan field-specific feedback

**File yang Dibuat/Dimodifikasi:**
- ✨ `packages/shared/validation.ts` (NEW)
- ✨ `apps/public-site/src/routes/api/contact.post.ts` (NEW)
- 📝 `apps/public-site/src/routes/kontak.tsx` (IMPROVED)

---

### 4. ✅ File .env.example Tidak Ada (Masalah #8)

**Masalah Awal:**
- README memerintahkan `cp apps/public-site/.env.example ...`
- File tidak ada di repository
- Setup baru akan gagal immediately
- No documentation tentang required env vars

**Solusi Implementasi:**

Dibuat 3 `.env.example` files dengan comprehensive documentation:

#### `.env.example` (Root)
```bash
# Shared environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_R2_PUBLIC_URL=https://your-bucket.your-domain.com
VITE_APP_URL=http://localhost:4173
VITE_DEV_TENANT=demo

# Rate Limiting
VITE_RATE_LIMIT_ENABLED=true
VITE_RATE_LIMIT_MAX_REQUESTS=5
VITE_RATE_LIMIT_WINDOW_MS=900000

# R2 Presign Endpoint (server-side only)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
```

#### `apps/public-site/.env.example`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_R2_PUBLIC_URL=https://your-bucket.your-domain.com
VITE_APP_URL=http://localhost:4173
VITE_DEV_TENANT=demo
VITE_RATE_LIMIT_ENABLED=true
VITE_RATE_LIMIT_MAX_REQUESTS=5
VITE_RATE_LIMIT_WINDOW_MS=900000
```

#### `apps/admin/.env.example`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_R2_PUBLIC_URL=https://your-bucket.your-domain.com
VITE_APP_URL=http://localhost:5173
VITE_DEV_TENANT=demo
```

**File yang Dibuat:**
- ✨ `.env.example` (NEW)
- ✨ `apps/public-site/.env.example` (NEW)
- ✨ `apps/admin/.env.example` (NEW)

---

### 5. ✅ Konfigurasi R2 Presign Endpoint (Masalah #9)

**Masalah Awal:**
- `getUploadPresignedUrl` memanggil `/api/r2-presign`
- Endpoint tidak ada implementasinya di codebase
- Butuh backend terpisah untuk upload

**Solusi Implementasi:**

#### A. Presigned URL Generation Module (`packages/shared/presigned-url.ts`)
```typescript
// AWS SDK integration untuk presigned URLs
export async function generatePresignedUrl(
  filename: string,
  contentType: string,
  folder: string = "uploads",
): Promise<PresignedUrlResponse>

// Validates:
- File parameters (filename, contentType)
- Folder name (prevent directory traversal)
- File size constraints

// Returns:
{
  presignedUrl: "https://...", // Signed URL valid for 1 hour
  objectKey: "uploads/1234567890-filename.ext",
  expiresIn: 3600,
}
```

#### B. API Endpoint Implementation (`api/r2-presign.post.ts`)
```typescript
// POST /api/r2-presign
// Validates request & returns presigned URL

Request body:
{
  filename: string
  contentType: string
  folder?: string (default: "uploads")
}

Response:
{
  presignedUrl: string
  objectKey: string
  expiresIn: number
}

Error handling:
- 405: Method not allowed
- 400: Validation error (bad filename, folder, etc)
- 500: R2 credential issues atau S3 error
```

**Security Features:**
- Folder validation (prevent `../` attacks)
- Filename sanitization
- Content-type validation
- Server-side credential storage (never exposed to client)
- Presigned URL expiry (1 hour)

**Setup Requirements:**
```bash
# Environment variables (server-side only)
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-api-token-id
R2_SECRET_ACCESS_KEY=your-api-token-secret
R2_BUCKET_NAME=your-bucket-name
```

**File yang Dibuat:**
- ✨ `packages/shared/presigned-url.ts` (NEW)
- ✨ `apps/public-site/src/routes/api/r2-presign.post.ts` (NEW)

---

## Ringkasan File yang Dibuat

### New Files (Perbaikan):
1. ✨ `packages/shared/validation.ts` - Input validation
2. ✨ `packages/shared/rate-limit.ts` - Rate limiting
3. ✨ `packages/shared/presigned-url.ts` - R2 upload handling
4. ✨ `apps/public-site/src/lib/error-handling.ts` - Error utilities
5. ✨ `apps/public-site/src/routes/api/contact.post.ts` - Contact API with validation & rate limit
6. ✨ `apps/public-site/src/routes/api/r2-presign.post.ts` - Presigned URL endpoint
7. ✨ `.env.example` - Root config template
8. ✨ `apps/public-site/.env.example` - Public site config template
9. ✨ `apps/admin/.env.example` - Admin config template

### Modified Files:
1. 📝 `apps/public-site/src/routes/kontak.tsx` - Updated to use API endpoint
2. 📝 `apps/public-site/src/routes/berita.tsx` - Enhanced error handling example

---

## Usage Examples

### 1. Using Error Handling
```typescript
import { handleSupabaseError } from "@/lib/error-handling";

try {
  const data = await getNews();
} catch (error) {
  const message = handleSupabaseError(error, "id"); // Indonesian
  console.error(message);
}
```

### 2. Using Validation
```typescript
import { validateContactMessage } from "@shared/validation";

const result = validateContactMessage({
  name: "John",
  org: "Company",
  email: "john@example.com",
  message: "Hello world",
});

if (!result.isValid) {
  console.log(result.errors); // Array of validation errors
}
```

### 3. Using Rate Limiting
```typescript
import { checkRateLimit, getRateLimitStatus } from "@shared/rate-limit";

const clientIp = "192.168.1.1";
if (!checkRateLimit(clientIp)) {
  // User has exceeded rate limit
  const status = getRateLimitStatus(clientIp);
  console.log(`Retry after ${status.resetTime}`);
}
```

### 4. Presigned URL Upload
```typescript
import { getUploadPresignedUrl } from "@shared/r2";

const { presignedUrl, objectKey } = await getUploadPresignedUrl(
  "photo.jpg",
  "image/jpeg",
  "gallery"
);

// Now use presignedUrl to upload directly to R2
const response = await fetch(presignedUrl, {
  method: "PUT",
  body: fileBlob,
  headers: { "Content-Type": "image/jpeg" },
});
```

---

## Production Considerations

### 1. Rate Limiting di Production
- Current: In-memory store (suitable untuk single-server)
- For scale: Migrate ke Redis untuk shared rate limiting across servers
- Alternative: Use Cloudflare Workers atau WAF rules

### 2. Error Logging
- Integrate dengan error tracking service (Sentry, LogRocket, dll)
- Monitor error patterns untuk preventive maintenance
- Set up alerts untuk critical errors

### 3. Input Validation
- Extend `validation.ts` untuk tipe data lain (News, Events, dll)
- Add regex patterns untuk domain-specific validations
- Consider using zod atau joi untuk schema validation

### 4. R2 Credentials
- Use environment variables, never hardcode
- Rotate credentials regularly
- Use IAM policies untuk restrict permissions
- Consider using Temporary Security Credentials

### 5. CORS & Security Headers
- Configure CORS untuk presigned URLs
- Add security headers: CSP, X-Frame-Options, dll
- Validate request origins

---

## Testing

Untuk menguji semua perbaikan:

```bash
# Test contact form dengan rate limiting
curl -X POST http://localhost:4173/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","org":"Org","email":"test@example.com","message":"Hello world"}'

# Test presigned URL endpoint
curl -X POST http://localhost:4173/api/r2-presign \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg"}'

# Test validation dengan invalid data
curl -X POST http://localhost:4173/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"","org":"","email":"invalid","message":"hi"}'
```

---

## Next Steps

1. ✅ Implement untuk routes lain (galeri, kegiatan, dll)
2. ✅ Add database audit logging untuk sensitive operations
3. ✅ Setup monitoring & alerting
4. ✅ Add automated tests untuk validation & rate limiting
5. ✅ Consider CAPTCHA untuk form submissions
6. ✅ Implement request signing untuk API security
