import PocketBase, { type ListResult } from "pocketbase";
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

const PB_URL = import.meta.env.VITE_PB_URL ?? "http://127.0.0.1:8090";
const client = new PocketBase(PB_URL);

export function getPocketBaseClient() {
  return client;
}

export async function getNews(lang: Lang, page = 1, perPage = 10, category?: string): Promise<ListResult<NewsArticle>> {
  const filters = ["published=true"];

  if (category) {
    filters.push(`category.id = "${category}"`);
  }

  return client.collection("news").getList<NewsArticle>(page, perPage, {
    sort: "-date",
    filter: filters.join(" && "),
  });
}

export async function getPublishedNewsFeed(lang: Lang, limit = 20): Promise<ListResult<NewsArticle>> {
  return client.collection("news").getList<NewsArticle>(1, limit, {
    sort: "-date",
    filter: "published=true",
  });
}

export async function getAllPublishedNews(): Promise<NewsArticle[]> {
  return client.collection("news").getFullList<NewsArticle>(200, {
    sort: "-date",
    filter: "published=true",
  });
}

export async function getNewsAdminList(page = 1, perPage = 10, filter?: string): Promise<ListResult<NewsArticle>> {
  return client.collection("news").getList<NewsArticle>(page, perPage, {
    sort: "-date",
    filter,
  });
}

export async function createNews(article: Omit<NewsArticle, "id">) {
  return client.collection("news").create({
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    cover: article.cover,
    category: article.category,
    date: article.date,
    published: article.published,
    slug: article.slug,
  });
}

export async function updateNews(id: string, article: Omit<NewsArticle, "id">) {
  return client.collection("news").update(id, {
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    cover: article.cover,
    category: article.category,
    date: article.date,
    published: article.published,
    slug: article.slug,
  });
}

export async function deleteNews(id: string) {
  return client.collection("news").delete(id);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle> {
  try {
    return await client.collection("news").getFirstListItem<NewsArticle>(`slug = "${slug}"`);
  } catch {
    return client.collection("news").getOne<NewsArticle>(slug);
  }
}

export async function getEventsAdminList(page = 1, perPage = 10, filter?: string): Promise<ListResult<EventItem>> {
  return client.collection("events").getList<EventItem>(page, perPage, {
    sort: "-date",
    filter,
  });
}

export async function createEvent(event: Omit<EventItem, "id">) {
  return client.collection("events").create({
    title: event.title,
    excerpt: event.excerpt,
    date: event.date,
    location: event.location,
    cover: event.cover,
    category: event.category,
    finished: event.finished,
  });
}

export async function updateEvent(id: string, event: Omit<EventItem, "id">) {
  return client.collection("events").update(id, {
    title: event.title,
    excerpt: event.excerpt,
    date: event.date,
    location: event.location,
    cover: event.cover,
    category: event.category,
    finished: event.finished,
  });
}

export async function deleteEvent(id: string) {
  return client.collection("events").delete(id);
}

export async function getOfficersAdminList(page = 1, perPage = 10, filter?: string): Promise<ListResult<Officer>> {
  return client.collection("officers").getList<Officer>(page, perPage, {
    sort: "order",
    filter,
  });
}

export async function createOfficer(officer: Omit<Officer, "id">) {
  return client.collection("officers").create({
    rankCode: officer.rankCode,
    rank: officer.rank,
    name: officer.name,
    position: officer.position,
    photo: officer.photo,
    status: officer.status,
    termStart: officer.termStart,
    termEnd: officer.termEnd,
    bio: officer.bio,
    order: officer.order,
  });
}

export async function updateOfficer(id: string, officer: Omit<Officer, "id">) {
  return client.collection("officers").update(id, {
    rankCode: officer.rankCode,
    rank: officer.rank,
    name: officer.name,
    position: officer.position,
    photo: officer.photo,
    status: officer.status,
    termStart: officer.termStart,
    termEnd: officer.termEnd,
    bio: officer.bio,
    order: officer.order,
  });
}

export async function deleteOfficer(id: string) {
  return client.collection("officers").delete(id);
}

export async function getGalleryAdminList(page = 1, perPage = 10, filter?: string): Promise<ListResult<GalleryItem>> {
  return client.collection("gallery").getList<GalleryItem>(page, perPage, {
    sort: "order",
    filter,
  });
}

export async function createGalleryItem(item: Omit<GalleryItem, "id">) {
  return client.collection("gallery").create({
    image: item.image,
    caption: item.caption,
    takenAt: item.takenAt,
    order: item.order,
  });
}

export async function updateGalleryItem(id: string, item: Omit<GalleryItem, "id">) {
  return client.collection("gallery").update(id, {
    image: item.image,
    caption: item.caption,
    takenAt: item.takenAt,
    order: item.order,
  });
}

export async function deleteGalleryItem(id: string) {
  return client.collection("gallery").delete(id);
}

export async function getPressKitAdminList(page = 1, perPage = 10, filter?: string): Promise<ListResult<PressKitItem>> {
  return client.collection("press_kit").getList<PressKitItem>(page, perPage, {
    sort: "order",
    filter,
  });
}

export async function createPressKitItem(item: Omit<PressKitItem, "id">) {
  return client.collection("press_kit").create({
    name: item.name,
    fileAsset: item.fileAsset,
    sizeLabel: item.sizeLabel,
    type: item.type,
    order: item.order,
  });
}

export async function updatePressKitItem(id: string, item: Omit<PressKitItem, "id">) {
  return client.collection("press_kit").update(id, {
    name: item.name,
    fileAsset: item.fileAsset,
    sizeLabel: item.sizeLabel,
    type: item.type,
    order: item.order,
  });
}

export async function deletePressKitItem(id: string) {
  return client.collection("press_kit").delete(id);
}

export async function getContactMessages(page = 1, perPage = 20, filter?: string): Promise<ListResult<ContactMessage>> {
  return client.collection("contacts").getList<ContactMessage>(page, perPage, {
    sort: "-created",
    filter,
  });
}

export async function markContactRead(id: string) {
  return client.collection("contacts").update(id, {
    status: "read",
  });
}

export async function getEvents(upcoming?: boolean) {
  const filter = upcoming ? "date >= now()" : "date < now()";
  return client.collection("events").getList(1, 20, {
    sort: "-date",
    filter,
  });
}

export async function getOfficers(status: "active" | "past"): Promise<ListResult<Officer>> {
  return client.collection("officers").getList<Officer>(1, 50, {
    sort: "order",
    filter: `status = \"${status}\"`,
  });
}

export async function getGallery(): Promise<ListResult<GalleryItem>> {
  return client.collection("gallery").getList<GalleryItem>(1, 50, {
    sort: "order",
  });
}

export async function getPressKit(): Promise<ListResult<PressKitItem>> {
  return client.collection("press_kit").getList<PressKitItem>(1, 50, {
    sort: "order",
  });
}

export async function getSetting(key: string): Promise<SettingRecord> {
  return client.collection("settings").getFirstListItem<SettingRecord>(`key = "${key}"`);
}

export async function searchContent(query: string, lang: Lang): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { news: [], events: [] };
  }

  const [news, events] = await Promise.all([
    client.collection("news").getList<NewsArticle>(1, 20, {
      sort: "-date",
      filter: "published=true",
      search: trimmed,
    }),
    client.collection("events").getList<EventItem>(1, 20, {
      sort: "date",
      search: trimmed,
    }),
  ]);

  return {
    news: news.items,
    events: events.items,
  };
}

export async function submitContact(contact: Omit<ContactMessage, "status" | "createdAt">) {
  return client.collection("contacts").create({
    ...contact,
    status: "new",
  });
}
