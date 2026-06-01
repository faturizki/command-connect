import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { searchContent } from "@shared/supabase";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Pencarian — Korps Publik & Pers" },
      {
        name: "description",
        content: "Cari berita dan kegiatan Korps Publik & Pers secara cepat dan akurat.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["search", submittedQuery, lang],
    queryFn: () => searchContent(submittedQuery, lang),
    enabled: submittedQuery.length > 0,
  });

  const results = useMemo(
    () => ({
      news: data?.news ?? [],
      events: data?.events ?? [],
    }),
    [data],
  );

  const hasResults = results.news.length > 0 || results.events.length > 0;

  return (
    <SiteLayout>
      <SectionHeader
        number="08"
        eyebrow={lang === "id" ? "PENCARIAN" : "SEARCH"}
        title={t("sec_search")}
        lead={lang === "id" ? "Cari berita dan kegiatan dengan kata kunci." : "Search news and events by keyword."}
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedQuery(query.trim());
          }}
          className="mb-10 flex flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="search-input">
            {t("search_label")}
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full rounded-full border border-border bg-background py-4 pl-12 pr-4 text-sm outline-none focus:border-accent-red"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-accent-red px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-red/90"
          >
            {t("search_button")}
          </button>
        </form>

        {submittedQuery.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
            {lang === "id"
              ? "Masukkan kata kunci untuk memulai pencarian."
              : "Enter a search term to begin."}
          </div>
        ) : isLoading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
            {lang === "id" ? "Sedang mencari…" : "Searching..."}
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-rose-500">
            {lang === "id" ? "Terjadi kesalahan saat mencari." : "There was an error searching."}
          </div>
        ) : !hasResults ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground">
            {lang === "id"
              ? `Tidak ditemukan hasil untuk “${submittedQuery}”.`
              : `No results found for “${submittedQuery}”.`}
          </div>
        ) : (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {lang === "id" ? "Berita" : "News"}
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {results.news.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-border bg-card p-6">
                    <Link
                      to="/berita/$slug"
                      params={{ slug: String(item.slug ?? item.id ?? "") }}
                      className="font-display text-lg font-semibold text-foreground transition-colors hover:text-accent-red"
                    >
                      {item.title[lang]}
                    </Link>
                    <p className="mt-3 text-sm text-muted-foreground">{item.excerpt?.[lang]}</p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {lang === "id" ? "Kegiatan" : "Events"}
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {results.events.map((item) => (
                  <article key={item.id} className="rounded-3xl border border-border bg-card p-6">
                    <div className="font-display text-lg font-semibold text-foreground">{item.title[lang]}</div>
                    <p className="mt-3 text-sm text-muted-foreground">{item.excerpt?.[lang]}</p>
                    <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                      {item.location?.[lang]}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
