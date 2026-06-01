# Fitur Baru: YouTube Embedding, Digital Watermark, dan Hoax Checker

## Ringkasan
Tiga fitur baru untuk meningkatkan konten editorial dan kredibilitas:
1. **YouTube Video Embedding** - Admin menambahkan video YouTube ke dashboard untuk ditampilkan di public site
2. **Digital Watermark pada Press Release** - Otomatis watermark dokumen rilis pers saat diunduh
3. **Hoax Checker Display** - Tampilan perbandingan berita hoax vs fakta dengan stempel visual

---

## 1. YouTube Video Embedding

### Database Schema
```sql
CREATE TABLE videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,  -- e.g., "dQw4w9WgXcQ"
  description TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

### TypeScript Types
```typescript
export interface VideoItem {
  id?: string;
  tenant_id: string;
  title: string;
  youtube_id: string;
  description?: string;
  thumbnail_url?: string;
  published_at?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}
```

### API Functions (packages/shared/supabase.ts)
- `getVideos(tenantSlug?, page?, perPage?)` - Get published videos
- `getVideosAdmin(tenantSlug?, page?, perPage?)` - Get all videos (admin)
- `createVideo(video)` - Create new video
- `updateVideo(id, video)` - Update video
- `deleteVideo(id)` - Delete video

### Admin Component
- **VideoSection** component with editor form
- Fields: Title, YouTube URL/ID, Description, Publish date, Order
- Display list with thumbnails
- CRUD operations

### Public Site Component
- **VideoGallery** component
- Responsive grid layout
- Embedded iframe with YouTube player

---

## 2. Digital Watermark pada Press Release

### Database Schema
```sql
CREATE TABLE press_kit_watermarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  press_kit_id TEXT NOT NULL,
  watermark_config JSONB NOT NULL,  -- {position, opacity, text, rotation}
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (press_kit_id) REFERENCES press_kit(id)
);
```

### Watermark Config Format
```json
{
  "position": "center", // "center", "diagonal", "corners"
  "opacity": 0.15,
  "text": "DOKUMEN RESMI - Korps Publik & Pers",
  "rotation": 45,
  "fontSize": 48,
  "color": "rgba(128, 128, 128, 0.3)"
}
```

### Implementation Strategy
- Use server-side library (e.g., `pdfkit` for PDF, `jimp` for images)
- Apply watermark when file is requested for download
- Store original file, apply watermark on-the-fly
- Backend endpoint: `GET /api/press-kit/:id/download?watermark=true`

### Admin Configuration
- PressKitSection watermark settings
- Configurable watermark template per tenant

---

## 3. Hoax Checker - Status Berita Display

### Database Schema
```sql
CREATE TABLE hoax_claims (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  news_article_id TEXT NOT NULL,
  hoax_claim_title TEXT NOT NULL,
  hoax_claim_image_url TEXT,
  hoax_claim_source TEXT,
  fact_check_title TEXT NOT NULL,
  fact_check_body TEXT NOT NULL,
  status "hoax" | "misinformation" | "partially_true" | "true",
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (news_article_id) REFERENCES news(id)
);
```

### TypeScript Types
```typescript
export interface HoaxClaim {
  id?: string;
  tenant_id: string;
  news_article_id: string;
  hoax_claim_title: string;
  hoax_claim_image_url?: string;
  hoax_claim_source?: string;
  fact_check_title: string;
  fact_check_body: string;
  status: "hoax" | "misinformation" | "partially_true" | "true";
  created_at?: string;
  updated_at?: string;
}
```

### API Functions
- `getHoaxClaimsByNewsId(newsId)` - Get hoax claim for a news article
- `createHoaxClaim(claim)` - Create hoax claim entry
- `updateHoaxClaim(id, claim)` - Update claim
- `deleteHoaxClaim(id)` - Delete claim

### Admin Component
- **HoaxCheckerSection** component (optional integrated into NewsSection)
- Form fields:
  - Hoax claim title
  - Hoax claim screenshot
  - Hoax claim source
  - Fact check title (usually mirrors news article title)
  - Fact check body
  - Status selector (hoax/misinformation/partially_true/true)
- Display attached hoax claims for each news article

### Public Site Component
- **HoaxCheckerBanner** component
- Two-column layout:
  - Left: Screenshot with red "HOAX/DISINFORMASI" stempel overlay
  - Right: Official fact check text
- Stempel design: Large red text, rotated, semi-transparent
- Show only if hoax_claim exists for news article

---

## Implementation Priority
1. **Phase 1**: YouTube Embedding (least complex)
2. **Phase 2**: Hoax Checker UI/UX (medium complexity)
3. **Phase 3**: Digital Watermark (backend complexity)

## Files to Create/Modify
- `packages/shared/types.ts` - Add new types
- `packages/shared/supabase.ts` - Add API functions
- `apps/admin/src/components/VideoSection.tsx` - New
- `apps/admin/src/components/HoaxCheckerSection.tsx` - New
- `apps/public-site/src/components/ui/video-gallery.tsx` - New
- `apps/public-site/src/components/ui/hoax-checker-banner.tsx` - New
- Database migrations (if using Supabase SQL)

