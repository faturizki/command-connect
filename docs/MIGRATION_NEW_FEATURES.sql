-- Migration: Add Videos, HoaxClaims, and PressKitWatermarks tables
-- Description: Support for YouTube embedding, hoax checker, and digital watermarks
-- Created: 2026-06-01

-- ===== Videos Table =====
-- Stores YouTube videos for public display
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  published_at DATE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, youtube_id)
);

-- Index for tenant_id and ordering
CREATE INDEX idx_videos_tenant_order ON videos(tenant_id, "order");

-- Enable RLS for Videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_videos" ON videos
  USING (tenant_id = current_setting('request.jwt.claims.tenant_id')::UUID)
  WITH CHECK (tenant_id = current_setting('request.jwt.claims.tenant_id')::UUID);

-- ===== Hoax Claims Table =====
-- Stores hoax/misinformation claims linked to news articles with fact checks
CREATE TABLE IF NOT EXISTS hoax_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  news_article_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  hoax_claim_title TEXT NOT NULL,
  hoax_claim_image_url TEXT,
  hoax_claim_source TEXT,
  fact_check_title TEXT NOT NULL,
  fact_check_body TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'hoax',
  -- status can be: 'hoax', 'misinformation', 'partially_true', 'true'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, news_article_id)
);

-- Index for tenant_id and news_article_id
CREATE INDEX idx_hoax_claims_tenant ON hoax_claims(tenant_id);
CREATE INDEX idx_hoax_claims_news ON hoax_claims(news_article_id);

-- Enable RLS for Hoax Claims
ALTER TABLE hoax_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_hoax_claims" ON hoax_claims
  USING (tenant_id = current_setting('request.jwt.claims.tenant_id')::UUID)
  WITH CHECK (tenant_id = current_setting('request.jwt.claims.tenant_id')::UUID);

-- ===== Press Kit Watermarks Table =====
-- Stores watermark configuration for press kit documents (for future use)
CREATE TABLE IF NOT EXISTS press_kit_watermarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  press_kit_id UUID NOT NULL REFERENCES press_kit(id) ON DELETE CASCADE,
  watermark_config JSONB NOT NULL,
  -- config format: {position: 'center'|'diagonal'|'corners', opacity: 0-1, text: string, rotation: 0-360, fontSize: number, color: rgba string}
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Index for tenant_id and press_kit_id
CREATE INDEX idx_press_kit_watermarks_tenant ON press_kit_watermarks(tenant_id);
CREATE INDEX idx_press_kit_watermarks_press_kit ON press_kit_watermarks(press_kit_id);

-- Enable RLS for Press Kit Watermarks
ALTER TABLE press_kit_watermarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_press_kit_watermarks" ON press_kit_watermarks
  USING (tenant_id = current_setting('request.jwt.claims.tenant_id')::UUID)
  WITH CHECK (tenant_id = current_setting('request.jwt.claims.tenant_id')::UUID);

-- ===== Rollback =====
-- To rollback this migration, uncomment and run:
/*
DROP TABLE IF EXISTS press_kit_watermarks CASCADE;
DROP TABLE IF EXISTS hoax_claims CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
*/
