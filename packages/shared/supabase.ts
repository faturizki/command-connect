import { createClient } from "@supabase/supabase-js";
import { getCurrentTenantSlug } from "./tenant";
import type {
  Lang,
  NewsArticle,
  EventItem,
  Officer,
  GalleryItem,
  PressKitItem,
  ContactMessage,
  SettingRecord,
  SearchResults,
} from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let serverSupabaseClient: ReturnType<typeof createClient> | null = null;

function getServerSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("Server Supabase client must be used on the server only");
  }

  if (serverSupabaseClient) return serverSupabaseClient;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  serverSupabaseClient = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return serverSupabaseClient;
}

export function getSupabaseClient() {
  if (typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getServerSupabaseClient();
  }
  return supabase;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  perPage: number;
  totalPages: number;
}

function toPagedResult<T>(data: T[] | null, count: number | null, page: number, perPage: number): PagedResult<T> {
  const totalItems = count ?? data?.length ?? 0;
  return {
    items: data ?? [],
    totalItems,
    page,
    perPage,
    totalPages: perPage > 0 ? Math.max(1, Math.ceil(totalItems / perPage)) : 1,
  };
}

function buildJsonbSearch(query: string) {
  const escaped = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
  const pattern = `%${escaped}%`;
  return `title->>id.ilike.${pattern},title->>en.ilike.${pattern},excerpt->>id.ilike.${pattern},excerpt->>en.ilike.${pattern}`;
}

const tenantIdCache = new Map<string, string>();

function getEffectiveTenantSlug(tenantSlug?: string | null) {
  if (tenantSlug && tenantSlug !== "root") return tenantSlug;
  return getCurrentTenantSlug();
}

export async function getTenantId(tenantSlug?: string | null): Promise<string> {
  const slug = getEffectiveTenantSlug(tenantSlug);

  if (tenantIdCache.has(slug)) {
    return tenantIdCache.get(slug)!;
  }

  const client = typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY ? getServerSupabaseClient() : supabase;
  const { data, error } = await client
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) throw error;

  const id = (data as { id: string } | null)?.id;
  if (!id) throw new Error(`Tenant not found for slug: ${slug}`);

  tenantIdCache.set(slug, id);
  return id;
}

export async function adminSignIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function adminSignOut() {
  return supabase.auth.signOut();
}

export function getSupabaseClient() {
  return supabase;
}

export async function getNews(lang: Lang, page = 1, perPage = 10, category?: string, tenantSlug?: string | null): Promise<PagedResult<NewsArticle>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("news")
    .select("*", { count: "exact" })
    .eq("published", true)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as NewsArticle[], count, page, perPage);
}

export async function getPublishedNewsFeed(lang: Lang, limit = 20, tenantSlug?: string | null): Promise<PagedResult<NewsArticle>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("news")
    .select("*", { count: "exact" })
    .eq("published", true)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false })
    .range(0, limit - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as NewsArticle[], count, 1, limit);
}

export async function getAllPublishedNews(page = 1, perPage = 100, tenantSlug?: string | null): Promise<PagedResult<NewsArticle>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("news")
    .select("id, slug, date, title, excerpt, cover, category", { count: "exact" })
    .eq("published", true)
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as NewsArticle[], count, page, perPage);
}

export async function getNewsAdminList(page = 1, perPage = 10, publishedOnly = false, tenantSlug?: string | null): Promise<PagedResult<NewsArticle>> {
  const tenantId = await getTenantId(tenantSlug);
  let builder = supabase
    .from("news")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false });

  if (publishedOnly) {
    builder = builder.eq("published", true);
  }

  const { data, count, error } = await builder.range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as NewsArticle[], count, page, perPage);
}

export async function createNews(article: Omit<NewsArticle, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("news")
    .insert({ ...article, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;
  return data as NewsArticle;
}

export async function updateNews(id: string, article: Omit<NewsArticle, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("news")
    .update(article)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as NewsArticle;
}

export async function deleteNews(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { error } = await supabase.from("news").delete().eq("id", id).eq("tenant_id", tenantId);
  if (error) throw error;
}

export async function getNewsBySlug(slug: string, tenantSlug?: string | null): Promise<NewsArticle> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data as NewsArticle;
}

export async function getEventsAdminList(page = 1, perPage = 10, upcoming?: boolean, tenantSlug?: string | null): Promise<PagedResult<EventItem>> {
  const tenantId = await getTenantId(tenantSlug);
  let builder = supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false });

  if (upcoming !== undefined) {
    builder = upcoming ? builder.gte("date", new Date().toISOString()) : builder.lt("date", new Date().toISOString());
  }

  const { data, count, error } = await builder.range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as EventItem[], count, page, perPage);
}

export async function createEvent(event: Omit<EventItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("events")
    .insert({ ...event, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;
  return data as EventItem;
}

export async function updateEvent(id: string, event: Omit<EventItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("events")
    .update(event)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as EventItem;
}

export async function deleteEvent(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { error } = await supabase.from("events").delete().eq("id", id).eq("tenant_id", tenantId);
  if (error) throw error;
}

export async function getOfficersAdminList(page = 1, perPage = 10, status?: "active" | "past", tenantSlug?: string | null): Promise<PagedResult<Officer>> {
  const tenantId = await getTenantId(tenantSlug);
  let builder = supabase
    .from("officers")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("order", { ascending: true });

  if (status) {
    builder = builder.eq("status", status);
  }

  const { data, count, error } = await builder.range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as Officer[], count, page, perPage);
}

export async function createOfficer(officer: Omit<Officer, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("officers")
    .insert({ ...officer, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;
  return data as Officer;
}

export async function updateOfficer(id: string, officer: Omit<Officer, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("officers")
    .update(officer)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as Officer;
}

export async function deleteOfficer(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { error } = await supabase.from("officers").delete().eq("id", id).eq("tenant_id", tenantId);
  if (error) throw error;
}

export async function getGalleryAdminList(page = 1, perPage = 10, tenantSlug?: string | null): Promise<PagedResult<GalleryItem>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("gallery")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("order", { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as GalleryItem[], count, page, perPage);
}

export async function createGalleryItem(item: Omit<GalleryItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("gallery")
    .insert({ ...item, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;
  return data as GalleryItem;
}

export async function updateGalleryItem(id: string, item: Omit<GalleryItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("gallery")
    .update(item)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as GalleryItem;
}

export async function deleteGalleryItem(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { error } = await supabase.from("gallery").delete().eq("id", id).eq("tenant_id", tenantId);
  if (error) throw error;
}

export async function getPressKitAdminList(page = 1, perPage = 10, tenantSlug?: string | null): Promise<PagedResult<PressKitItem>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("press_kit")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("order", { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as PressKitItem[], count, page, perPage);
}

export async function createPressKitItem(item: Omit<PressKitItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("press_kit")
    .insert({ ...item, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;
  return data as PressKitItem;
}

export async function updatePressKitItem(id: string, item: Omit<PressKitItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("press_kit")
    .update(item)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as PressKitItem;
}

export async function deletePressKitItem(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { error } = await supabase.from("press_kit").delete().eq("id", id).eq("tenant_id", tenantId);
  if (error) throw error;
}

export async function getContactMessages(page = 1, perPage = 20, status?: string, tenantSlug?: string | null): Promise<PagedResult<ContactMessage>> {
  const tenantId = await getTenantId(tenantSlug);
  let builder = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (status) {
    builder = builder.eq("status", status);
  }

  const { data, count, error } = await builder.range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as ContactMessage[], count, page, perPage);
}

export async function markContactRead(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("contacts")
    .update({ status: "read" })
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as ContactMessage;
}

export async function submitContact(contact: Omit<ContactMessage, "status" | "created_at" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const supabaseClient = getSupabaseClient();

  const { data, error } = await supabaseClient
    .from("contacts")
    .insert({
      name: contact.name,
      org: contact.org,
      email: contact.email,
      message: contact.message,
      status: "new",
      tenant_id: tenantId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ContactMessage;
}

export async function getEvents(upcoming?: boolean, tenantSlug?: string | null): Promise<PagedResult<EventItem>> {
  const tenantId = await getTenantId(tenantSlug);
  let builder = supabase
    .from("events")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("date", { ascending: false });

  if (upcoming !== undefined) {
    builder = upcoming ? builder.gte("date", new Date().toISOString()) : builder.lt("date", new Date().toISOString());
  }

  const { data, count, error } = await builder.range(0, 19);
  if (error) throw error;
  return toPagedResult((data ?? []) as EventItem[], count, 1, 20);
}

export async function getOfficers(status: "active" | "past", tenantSlug?: string | null): Promise<PagedResult<Officer>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("officers")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("order", { ascending: true })
    .eq("status", status)
    .range(0, 49);

  if (error) throw error;
  return toPagedResult((data ?? []) as Officer[], count, 1, 50);
}

export async function getGallery(tenantSlug?: string | null): Promise<PagedResult<GalleryItem>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("gallery")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("order", { ascending: true })
    .range(0, 49);

  if (error) throw error;
  return toPagedResult((data ?? []) as GalleryItem[], count, 1, 50);
}

export async function getPressKit(tenantSlug?: string | null): Promise<PagedResult<PressKitItem>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("press_kit")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("order", { ascending: true })
    .range(0, 49);

  if (error) throw error;
  return toPagedResult((data ?? []) as PressKitItem[], count, 1, 50);
}

export async function getSetting(key: string, tenantSlug?: string | null): Promise<SettingRecord> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("key", key)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data as SettingRecord;
}

export async function searchContent(query: string, lang: Lang, tenantSlug?: string | null): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { news: [], events: [] };
  }

  const tenantId = await getTenantId(tenantSlug);
  const textSearch = buildJsonbSearch(trimmed);

  const [newsResult, eventsResult] = await Promise.all([
    supabase
      .from("news")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("published", true)
      .order("date", { ascending: false })
      .or(textSearch)
      .range(0, 19),
    supabase
      .from("events")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("date", { ascending: false })
      .or(buildJsonbSearch(trimmed))
      .range(0, 19),
  ]);

  if (newsResult.error) throw newsResult.error;
  if (eventsResult.error) throw eventsResult.error;

  return {
    news: (newsResult.data ?? []) as SearchResults['news'],
    events: (eventsResult.data ?? []) as SearchResults['events'],
  };
}

// ===== VIDEO FUNCTIONS =====
export async function getVideos(page = 1, perPage = 10, tenantSlug?: string | null): Promise<PagedResult<VideoItem>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("videos")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("published_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as VideoItem[], count, page, perPage);
}

export async function getVideosAdmin(page = 1, perPage = 10, tenantSlug?: string | null): Promise<PagedResult<VideoItem>> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, count, error } = await supabase
    .from("videos")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("order", { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) throw error;
  return toPagedResult((data ?? []) as VideoItem[], count, page, perPage);
}

export async function createVideo(video: Omit<VideoItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("videos")
    .insert({ ...video, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;
  return data as VideoItem;
}

export async function updateVideo(id: string, video: Omit<VideoItem, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("videos")
    .update(video)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as VideoItem;
}

export async function deleteVideo(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { error } = await supabase.from("videos").delete().eq("id", id).eq("tenant_id", tenantId);
  if (error) throw error;
}

// ===== HOAX CLAIM FUNCTIONS =====
export async function getHoaxClaimsByNewsId(newsId: string, tenantSlug?: string | null): Promise<HoaxClaim[]> {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("hoax_claims")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("news_article_id", newsId);

  if (error) throw error;
  return (data ?? []) as HoaxClaim[];
}

export async function createHoaxClaim(claim: Omit<HoaxClaim, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("hoax_claims")
    .insert({ ...claim, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw error;
  return data as HoaxClaim;
}

export async function updateHoaxClaim(id: string, claim: Omit<HoaxClaim, "id" | "tenant_id">, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { data, error } = await supabase
    .from("hoax_claims")
    .update(claim)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw error;
  return data as HoaxClaim;
}

export async function deleteHoaxClaim(id: string, tenantSlug?: string | null) {
  const tenantId = await getTenantId(tenantSlug);
  const { error } = await supabase.from("hoax_claims").delete().eq("id", id).eq("tenant_id", tenantId);
  if (error) throw error;
}
