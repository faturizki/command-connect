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
  rankCode: string;
  rank: Rank;
  name: string;
  position: Position;
  photo: string;
  status: "active" | "past";
  termStart: string;
  termEnd: string;
  bio: LocalizedText;
  order?: number;
}

export interface NewsArticle {
  id?: string;
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
  image: string;
  caption: LocalizedText;
  takenAt: string;
  order?: number;
}

export interface PressKitItem {
  id?: string;
  name: string;
  fileAsset: string;
  sizeLabel: string;
  type: string;
  order?: number;
}

export interface ContactMessage {
  id?: string;
  name: string;
  org: string;
  email: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
  created?: string;
}

export interface SettingRecord {
  id?: string;
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
