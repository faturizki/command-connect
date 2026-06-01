# Implementasi Fitur Baru: YouTube, Hoax Checker, dan Watermark

## Overview
Tiga fitur baru telah ditambahkan untuk meningkatkan kredibilitas konten dan engagement publik:

1. **YouTube Video Embedding** - Kelola dan tampilkan video YouTube di dashboard admin
2. **Hoax Checker** - Klarifikasi berita hoax dengan display side-by-side (klaim vs fakta)
3. **Digital Watermark** (Rancangan) - Otomatis watermark dokumen press kit saat diunduh

---

## 1. YouTube Video Embedding

### Fitur
- Upload metadata video YouTube (ID, judul, deskripsi) di admin
- Kontrol urutan tampilan video
- Tampilan responsive di public site dengan embedded player
- Support thumbnail otomatis dari YouTube

### Database
Tabel `videos` dengan fields:
- `id`, `tenant_id`, `title`, `youtube_id`, `description`, `thumbnail_url`, `published_at`, `order`

### API Functions
```typescript
// packages/shared/supabase.ts
getVideos(page, perPage, tenantSlug?)
getVideosAdmin(page, perPage, tenantSlug?)
createVideo(video, tenantSlug?)
updateVideo(id, video, tenantSlug?)
deleteVideo(id, tenantSlug?)
```

### Admin Interface
**VideoSection Component** (`apps/admin/src/components/VideoSection.tsx`)

Features:
- Form untuk input judul, YouTube URL/ID, deskripsi, tanggal publikasi, urutan
- Auto-extract YouTube ID dari URL
- CRUD operations dengan konfirmasi delete
- List view dengan sorting berdasarkan order

### Public Site Display
**VideoGallery Component** (`apps/public-site/src/components/ui/video-gallery.tsx`)

Features:
- Responsive grid layout (3 kolom di desktop, 1 di mobile)
- Embedded YouTube iframe
- Info video (judul, deskripsi, tanggal)
- Hover effects

### Integration Steps
1. Run migration SQL di Supabase untuk create table `videos`
2. Import `VideoSection` di `apps/admin/src/App.tsx`
3. Add state untuk videos dan handler di App.tsx:
   ```typescript
   const [videosPage, setVideosPage] = useState(1);
   const [videos, setVideos] = useState<VideoItem[]>([]);
   const [videosTotal, setVideosTotal] = useState(0);
   const [videosLoading, setVideosLoading] = useState(false);
   const [videosError, setVideosError] = useState<string | null>(null);
   ```
4. Add case untuk "videos" di switch statement di useEffect
5. Wire handlers seperti `handleCreateVideo`, `handleUpdateVideo`, `handleDeleteVideo`
6. Render di admin main content area
7. Import `VideoGallery` di public site pages dan render dengan video data

---

## 2. Hoax Checker (Status Berita)

### Fitur
- Kelola hoax claims dan fact checks yang terhubung dengan artikel berita
- Display side-by-side layout dengan stempel visual
- Status tracking: hoax, misinformation, partially_true, true
- Support screenshot klaim hoax dengan watermark "HOAX/DISINFORMASI"

### Database
Tabel `hoax_claims` dengan fields:
- `id`, `tenant_id`, `news_article_id`
- `hoax_claim_title`, `hoax_claim_image_url`, `hoax_claim_source`
- `fact_check_title`, `fact_check_body`
- `status` (enum: hoax, misinformation, partially_true, true)

### API Functions
```typescript
// packages/shared/supabase.ts
getHoaxClaimsByNewsId(newsId, tenantSlug?)
createHoaxClaim(claim, tenantSlug?)
updateHoaxClaim(id, claim, tenantSlug?)
deleteHoaxClaim(id, tenantSlug?)
```

### Admin Interface
**HoaxCheckerSection Component** (`apps/admin/src/components/HoaxCheckerSection.tsx`)

Features:
- Dropdown untuk memilih artikel berita target
- Form untuk input klaim hoax (judul, screenshot URL, sumber)
- Form untuk input klarifikasi (judul, isi, status)
- Status selector dengan warna coding (merah untuk hoax, orange untuk misinformation, dll)
- List view dengan color-coded status badges

### Public Site Display
**HoaxCheckerBanner Component** (`apps/public-site/src/components/ui/hoax-checker-banner.tsx`)

Features:
- Two-column layout (klaim vs fakta)
- Screenshot klaim dengan rotated stamp overlay ("HOAX/DISINFORMASI")
- Status-dependent colors
- Responsive design (single column di mobile)
- Divider dengan "VS" text
- Fact check section dengan badge status dan full text

### Integration Steps
1. Run migration SQL di Supabase untuk create table `hoax_claims`
2. Import `HoaxCheckerSection` di `apps/admin/src/App.tsx`
3. Add state untuk hoax claims dan handlers di App.tsx
4. Add "hoax-checker" case di section navigation
5. Wire CRUD handlers
6. Import `HoaxCheckerBanner` di news detail page (`apps/public-site/src/routes/berita/$slug.tsx`)
7. Fetch dan render banner jika hoax claim exists:
   ```typescript
   const hoaxClaims = await getHoaxClaimsByNewsId(newsId);
   if (hoaxClaims.length > 0) {
     return <HoaxCheckerBanner claim={hoaxClaims[0]} />;
   }
   ```

---

## 3. Digital Watermark (Press Kit Documents)

### Concept
Sistem otomatis yang menambahkan watermark ke dokumen press kit saat diunduh. Ini mencegah pemalsuan dokumen resmi.

### Database
Tabel `press_kit_watermarks` untuk menyimpan konfigurasi:
- `id`, `tenant_id`, `press_kit_id`
- `watermark_config` (JSONB) dengan format:
  ```json
  {
    "position": "center",
    "opacity": 0.15,
    "text": "DOKUMEN RESMI - Korps Publik & Pers",
    "rotation": 45,
    "fontSize": 48,
    "color": "rgba(128, 128, 128, 0.3)"
  }
  ```

### Implementation Strategy
**Backend (Server-side):**
1. Create API endpoint: `GET /api/press-kit/:id/download?watermark=true`
2. Use library seperti `pdfkit` (PDF) atau `jimp` (images) untuk apply watermark
3. Generate watermarked file on-the-fly
4. Return dengan `Content-Disposition: attachment`

**Frontend:**
1. Link di press kit item button: `/api/press-kit/{id}/download?watermark=true`
2. Client-side preview option (optional)

### API Functions (untuk diimplementasikan kemudian)
```typescript
// Backend
createPressKitWatermark(config, tenantSlug?)
updatePressKitWatermark(id, config, tenantSlug?)
getPressKitWatermarkConfig(pressKitId, tenantSlug?)

// Service
applyPdfWatermark(pdfBuffer, config): Promise<Buffer>
applyImageWatermark(imageBuffer, config): Promise<Buffer>
```

### Admin Configuration
- Form di PressKitSection untuk set watermark config
- Preview watermark effect
- Test download dengan watermark

### Status: IN PROGRESS
Fase 3 ini memerlukan:
1. Backend server setup dengan document processing library
2. File storage strategy (local vs cloud)
3. Security considerations untuk file download
4. Performance optimization untuk large files

---

## File Structure Summary

### New Files Created
```
packages/shared/types.ts          (updated - added VideoItem, HoaxClaim)
packages/shared/supabase.ts       (updated - added API functions)
apps/admin/src/components/VideoSection.tsx
apps/admin/src/components/HoaxCheckerSection.tsx
apps/public-site/src/components/ui/video-gallery.tsx
apps/public-site/src/components/ui/hoax-checker-banner.tsx
docs/MIGRATION_NEW_FEATURES.sql
docs/IMPLEMENTATION_GUIDE.md       (this file)
```

### Files to Update (TODO)
```
apps/admin/src/App.tsx            (add video & hoax sections, state, handlers)
apps/public-site/src/routes/berita/$slug.tsx (add hoax banner display)
```

---

## Roadmap & Priorities

### Phase 1: YouTube Embedding ✅ DONE
- [x] Types & API functions
- [x] Admin component (VideoSection)
- [x] Public gallery component
- [ ] Integration into App.tsx

### Phase 2: Hoax Checker ✅ DONE (DESIGN ONLY)
- [x] Types & API functions
- [x] Admin component (HoaxCheckerSection)
- [x] Public display component (HoaxCheckerBanner)
- [ ] Integration into App.tsx
- [ ] Integration into news detail page

### Phase 3: Digital Watermark 🔄 IN PROGRESS (DESIGN)
- [x] Database schema design
- [x] Configuration format
- [ ] Backend implementation
- [ ] File download endpoint
- [ ] Admin configuration UI

---

## Testing Checklist

### YouTube Embedding
- [ ] Create video entry in admin
- [ ] Verify YouTube URL auto-extraction
- [ ] Verify embed in public site
- [ ] Test responsive layout on mobile

### Hoax Checker
- [ ] Create hoax claim for news article
- [ ] Verify display in detail page
- [ ] Test different status colors
- [ ] Verify watermark stamp rendering

### Watermark (when implemented)
- [ ] Download press kit file
- [ ] Verify watermark appears
- [ ] Test with different file types (PDF, images)
- [ ] Performance test with large files

---

## Security Considerations

1. **Videos**: Validate youtube_id format to prevent injection
2. **Hoax Claims**: Sanitize fact_check_body to prevent XSS
3. **Images**: Validate image URLs and implement CORS properly
4. **Watermark**: Ensure watermarked files cannot be easily removed
5. **RLS**: All tables have Row Level Security policies for tenant isolation

---

## Future Enhancements

1. **Video Playlist**: Group videos into playlists
2. **Advanced Hoax Analytics**: Track hoax claim patterns
3. **Watermark Batch Processing**: Process large document batches
4. **AI-powered Hoax Detection**: Auto-flag potential misinformation
5. **Social Media Integration**: Auto-share videos & fact checks

