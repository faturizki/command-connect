import PocketBase from "pocketbase";
import type { Lang, NewsArticle, EventItem, Officer, GalleryItem, PressKitItem, ContactMessage, SettingRecord } from "./types";

const PB_URL = import.meta.env.VITE_PB_URL ?? "http://127.0.0.1:8090";
const client = new PocketBase(PB_URL);

export function getPocketBaseClient() {
  return client;
}

export async function getNews(lang: Lang, page = 1, perPage = 10) {
  return client.collection("news").getList(page, perPage, {
    sort: ["-date"],
    filter: "published=true",
  });
}

export async function getEvents(upcoming?: boolean) {
  const filter = upcoming ? "date >= now()" : "date < now()";
  return client.collection("events").getList(1, 20, {
    sort: ["-date"],
    filter,
  });
}

export async function getOfficers(status: "active" | "past") {
  return client.collection("officers").getList(1, 50, {
    sort: ["order"],
    filter: `status = \"${status}\"`,
  });
}

export async function getGallery() {
  return client.collection("gallery").getList(1, 50, {
    sort: ["order"],
  });
}

export async function getPressKit() {
  return client.collection("press_kit").getList(1, 50, {
    sort: ["order"],
  });
}

export async function getSetting(key: string) {
  return client.collection("settings").getFirstListItem(`key = \"${key}\"`);
}

export async function submitContact(contact: Omit<ContactMessage, "status" | "createdAt">) {
  return client.collection("contacts").create({
    ...contact,
    status: "new",
  });
}
