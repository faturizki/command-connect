import { createClient } from "@supabase/supabase-js";
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

function applyFilter<T>(query: any, filter?: string) {
  if (!filter?.trim()) return query;

  const conditions = filter.split(" && ").map((part) => part.trim()).filter(Boolean);

  for (const condition of conditions) {
    const match = condition.match(/^(.+?)\s*(=|>=|<=|>|<)\s*(.+)$/);
    if (!match) continue;

    let [, field, operator, rawValue] = match;
    field = field.trim();
    rawValue = rawValue.trim();

    const isQuoted = rawValue.startsWith('"') && rawValue.endsWith('"');
    const valueString = isQuoted ? rawValue.slice(1, -1) : rawValue;
    const booleanValue = valueString === "true" ? true : valueString === "false" ? false : undefined;

    const normalizedField = field.includes(".") ? field.split(".").join("->>") : field;

    if (operator === "=") {
      if (booleanValue !== undefined) {
        query = query.eq(normalizedField, booleanValue);
      } else {
        query = query.eq(normalizedField, valueString);
      }
    } else if (operator === ">=") {
      if (valueString === "now()") {
        query = query.gte(normalizedField, new Date().toISOString());
      } else if (!Number.isNaN(Number(valueString))) {
        query = query.gte(normalizedField, Number(valueString));
      }
    } else if (operator === "<=") {
      if (!Number.isNaN(Number(valueString))) {
        query = query.lte(normalizedField, Number(valueString));
      }
    } else if (operator === ">") {
      if (!Number.isNaN(Number(valueString))) {
        query = query.gt(normalizedField, Number(valueString));
      }
    } else if (operator === "<") {
      if (!Number.isNaN(Number(valueString))) {
        query = query.lt(normalizedField, Number(valueString));
      }
    }
  }

  return query;
}

function buildJsonbSearch(query: string) {
  const escaped = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
  const pattern = `%${escaped}%`;
  return `title->>id.ilike.${pattern},title->>en.ilike.${pattern},excerpt->>id.ilike.${pattern},excerpt->>en.ilike.${pattern}`;
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

export async function getNews(lang: Lang, page = 1, perPage = 10, category?: string): Promise<PagedResult<NewsArticle>> {
  let query = supabase
    .from<NewsArticle>("news")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("date", { ascending: false });

  if (category) {
    query = query.eq("category->>id", category);
  }

  const rangeStart = (page - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);
  if (error) throw error;
  return toPagedResult(data, count, page, perPage);
}

export async function getPublishedNewsFeed(lang: Lang, limit = 20): Promise<PagedResult<NewsArticle>> {
  const { data, count, error } = await supabase
    .from<NewsArticle>("news")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("date", { ascending: false })
    .range(0, limit - 1);

  if (error) throw error;
  return toPagedResult(data, count, 1, limit);
}

export async function getAllPublishedNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from<NewsArticle>("news")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getNewsAdminList(page = 1, perPage = 10, filter?: string): Promise<PagedResult<NewsArticle>> {
  let query = supabase.from<NewsArticle>("news").select("*", { count: "exact" }).order("date", { ascending: false });
  query = applyFilter(query, filter);

  const rangeStart = (page - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);
  if (error) throw error;
  return toPagedResult(data, count, page, perPage);
}

export async function createNews(article: Omit<NewsArticle, "id">) {
  const { data, error } = await supabase.from<NewsArticle>("news").insert(article).select().single();
  if (error) throw error;
  return data;
}

export async function updateNews(id: string, article: Omit<NewsArticle, "id">) {
  const { data, error } = await supabase.from<NewsArticle>("news").update(article).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle> {
  const { data, error } = await supabase.from<NewsArticle>("news").select("*").eq("slug", slug).single();
  if (error) throw error;
  return data;
}

export async function getEventsAdminList(page = 1, perPage = 10, filter?: string): Promise<PagedResult<EventItem>> {
  let query = supabase.from<EventItem>("events").select("*", { count: "exact" }).order("date", { ascending: false });
  query = applyFilter(query, filter);
  const rangeStart = (page - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);
  if (error) throw error;
  return toPagedResult(data, count, page, perPage);
}

export async function createEvent(event: Omit<EventItem, "id">) {
  const { data, error } = await supabase.from<EventItem>("events").insert(event).select().single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, event: Omit<EventItem, "id">) {
  const { data, error } = await supabase.from<EventItem>("events").update(event).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function getOfficersAdminList(page = 1, perPage = 10, filter?: string): Promise<PagedResult<Officer>> {
  let query = supabase.from<Officer>("officers").select("*", { count: "exact" }).order("order", { ascending: true });
  query = applyFilter(query, filter);
  const rangeStart = (page - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);
  if (error) throw error;
  return toPagedResult(data, count, page, perPage);
}

export async function createOfficer(officer: Omit<Officer, "id">) {
  const { data, error } = await supabase.from<Officer>("officers").insert(officer).select().single();
  if (error) throw error;
  return data;
}

export async function updateOfficer(id: string, officer: Omit<Officer, "id">) {
  const { data, error } = await supabase.from<Officer>("officers").update(officer).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteOfficer(id: string) {
  const { error } = await supabase.from("officers").delete().eq("id", id);
  if (error) throw error;
}

export async function getGalleryAdminList(page = 1, perPage = 10, filter?: string): Promise<PagedResult<GalleryItem>> {
  let query = supabase.from<GalleryItem>("gallery").select("*", { count: "exact" }).order("order", { ascending: true });
  query = applyFilter(query, filter);
  const rangeStart = (page - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);
  if (error) throw error;
  return toPagedResult(data, count, page, perPage);
}

export async function createGalleryItem(item: Omit<GalleryItem, "id">) {
  const { data, error } = await supabase.from<GalleryItem>("gallery").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateGalleryItem(id: string, item: Omit<GalleryItem, "id">) {
  const { data, error } = await supabase.from<GalleryItem>("gallery").update(item).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(id: string) {
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}

export async function getPressKitAdminList(page = 1, perPage = 10, filter?: string): Promise<PagedResult<PressKitItem>> {
  let query = supabase.from<PressKitItem>("press_kit").select("*", { count: "exact" }).order("order", { ascending: true });
  query = applyFilter(query, filter);
  const rangeStart = (page - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);
  if (error) throw error;
  return toPagedResult(data, count, page, perPage);
}

export async function createPressKitItem(item: Omit<PressKitItem, "id">) {
  const { data, error } = await supabase.from<PressKitItem>("press_kit").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updatePressKitItem(id: string, item: Omit<PressKitItem, "id">) {
  const { data, error } = await supabase.from<PressKitItem>("press_kit").update(item).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePressKitItem(id: string) {
  const { error } = await supabase.from("press_kit").delete().eq("id", id);
  if (error) throw error;
}

export async function getContactMessages(page = 1, perPage = 20, filter?: string): Promise<PagedResult<ContactMessage>> {
  let query = supabase.from<ContactMessage>("contacts").select("*", { count: "exact" }).order("created_at", { ascending: false });
  query = applyFilter(query, filter);
  const rangeStart = (page - 1) * perPage;
  const rangeEnd = rangeStart + perPage - 1;
  const { data, count, error } = await query.range(rangeStart, rangeEnd);
  if (error) throw error;
  return toPagedResult(data, count, page, perPage);
}

export async function markContactRead(id: string) {
  const { data, error } = await supabase.from<ContactMessage>("contacts").update({ status: "read" }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function submitContact(contact: Omit<ContactMessage, "status" | "created_at">) {
  const { data, error } = await supabase.from<ContactMessage>("contacts").insert({
    name: contact.name,
    org: contact.org,
    email: contact.email,
    message: contact.message,
    status: "new",
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getEvents(upcoming?: boolean): Promise<PagedResult<EventItem>> {
  let query = supabase.from<EventItem>("events").select("*", { count: "exact" }).order("date", { ascending: false });
  if (upcoming !== undefined) {
    query = upcoming ? query.gte("date", new Date().toISOString()) : query.lt("date", new Date().toISOString());
  }
  const { data, count, error } = await query.range(0, 19);
  if (error) throw error;
  return toPagedResult(data, count, 1, 20);
}

export async function getOfficers(status: "active" | "past"): Promise<PagedResult<Officer>> {
  const { data, count, error } = await supabase
    .from<Officer>("officers")
    .select("*", { count: "exact" })
    .order("order", { ascending: true })
    .eq("status", status)
    .range(0, 49);
  if (error) throw error;
  return toPagedResult(data, count, 1, 50);
}

export async function getGallery(): Promise<PagedResult<GalleryItem>> {
  const { data, count, error } = await supabase.from<GalleryItem>("gallery").select("*", { count: "exact" }).order("order", { ascending: true }).range(0, 49);
  if (error) throw error;
  return toPagedResult(data, count, 1, 50);
}

export async function getPressKit(): Promise<PagedResult<PressKitItem>> {
  const { data, count, error } = await supabase.from<PressKitItem>("press_kit").select("*", { count: "exact" }).order("order", { ascending: true }).range(0, 49);
  if (error) throw error;
  return toPagedResult(data, count, 1, 50);
}

export async function getSetting(key: string): Promise<SettingRecord> {
  const { data, error } = await supabase.from<SettingRecord>("settings").select("*").eq("key", key).single();
  if (error) throw error;
  return data;
}

export async function searchContent(query: string, lang: Lang): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { news: [], events: [] };
  }

  const textSearch = buildJsonbSearch(trimmed);

  const [newsResult, eventsResult] = await Promise.all([
    supabase
      .from<NewsArticle>("news")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false })
      .or(textSearch)
      .range(0, 19),
    supabase
      .from<EventItem>("events")
      .select("*")
      .order("date", { ascending: false })
      .or(`title->>id.ilike.%${trimmed}%,title->>en.ilike.%${trimmed}%,excerpt->>id.ilike.%${trimmed}%,excerpt->>en.ilike.%${trimmed}%`)
      .range(0, 19),
  ]);

  if (newsResult.error) throw newsResult.error;
  if (eventsResult.error) throw eventsResult.error;

  return {
    news: newsResult.data ?? [],
    events: eventsResult.data ?? [],
  };
}
