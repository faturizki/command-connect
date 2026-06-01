export type Lang = "id" | "en";

export type LocalizedText = {
  id: string;
  en: string;
};

export type Rank = {
  code: string;
  name: LocalizedText;
};

export type Position = {
  name: LocalizedText;
  division: LocalizedText;
};

export interface Officer {
  id?: string;
  tenant_id: string;
  rank_code: string;
  rank: Rank;
  name: string;
  position: Position;
  photo: string;
  status: "active" | "past";
  term_start: string;
  term_end: string;
  bio: LocalizedText;
  order?: number;
}

export interface NewsArticle {
  id?: string;
  tenant_id: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  cover: string;
  category: LocalizedText;
  date: string;
  published: boolean;
  slug?: string;
}

export interface EventItem {
  id?: string;
  tenant_id: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  date: string;
  location: LocalizedText;
  cover: string;
  category: LocalizedText;
  finished?: boolean;
}

export interface GalleryItem {
  id?: string;
  tenant_id: string;
  image: string;
  caption: LocalizedText;
  taken_at: string;
  order?: number;
}

export interface PressKitItem {
  id?: string;
  tenant_id: string;
  name: string;
  file_asset: string;
  size_label: string;
  type: string;
  order?: number;
}

export interface ContactMessage {
  id?: string;
  tenant_id: string;
  name: string;
  org: string;
  email: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
  created?: string;
}

export interface SettingRecord {
  id?: string;
  tenant_id: string;
  key: string;
  value: Record<string, unknown>;
}

export interface SearchResultItem {
  id?: string;
  title: LocalizedText;
  excerpt?: LocalizedText;
  category?: LocalizedText;
  cover?: string;
  date?: string;
  slug?: string;
  location?: LocalizedText;
}

export interface SearchResults {
  news: SearchResultItem[];
  events: SearchResultItem[];
}

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
  role: "admin" | "editor" | "viewer";
  created_at: string;
}

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
