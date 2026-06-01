import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getPublishedNewsFeed, getAllPublishedNews } from "@shared/pb";

const SITE_URL = process.env.VITE_APP_URL || "http://localhost:4173";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/rss.xml") {
      return await handleRss();
    }

    if (url.pathname === "/sitemap.xml") {
      return await handleSitemap();
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

async function handleRss() {
  const news = await getPublishedNewsFeed("en", 20);
  const itemsXml = news.items
    .map((item) => {
      const itemLink = `${SITE_URL}/berita/${item.slug ?? item.id}`;
      const itemTitle = escapeXml(item.title?.en ?? item.title?.id ?? "Berita");
      const itemDescription = escapeXml(item.excerpt?.en ?? item.excerpt?.id ?? "");
      const pubDate = new Date(item.date).toUTCString();

      return `
    <item>
      <title>${itemTitle}</title>
      <link>${itemLink}</link>
      <guid isPermaLink="true">${itemLink}</guid>
      <description>${itemDescription}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Command Connect News</title>
    <link>${SITE_URL}/berita</link>
    <description>Berita terbaru dari Korps Publik & Pers.</description>
    <language>en-us</language>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
    },
  });
}

async function handleSitemap() {
  const newsItems = await getAllPublishedNews();
  const staticPaths = [
    "/",
    "/berita",
    "/search",
    "/galeri",
    "/kegiatan",
    "/kontak",
    "/press-kit",
    "/profil",
    "/riwayat",
    "/struktur",
  ];

  const urlsXml = [
    ...staticPaths,
    ...newsItems.map((item) => `/berita/${item.slug ?? item.id}`),
  ]
    .map((path) => `
    <url>
      <loc>${SITE_URL}${path}</loc>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlsXml}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
