import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getNews } from "@shared/supabase";
import { handleSupabaseError } from "@/lib/error-handling";

export const Route = createFileRoute("/berita")({
  head: () => ({
    meta: [
      { title: "Berita & Rilis Pers — Korps Publik & Pers" },
      {
        name: "description",
        content: "Rilis pers resmi, berita, dan pernyataan dari Korps Publik & Pers.",
      },
    ],
  }),
  component: BeritaPage,
});

function BeritaPage() {
  const { t, lang } = useI18n();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const perPage = 9;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["news", lang, page, category],
    queryFn: () => getNews(lang, page, perPage, category),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      errorMessage: lang === "id"
        ? "Gagal memuat daftar berita"
        : "Failed to load news list",
    },
  });

  const newsItems = data?.items ?? [];
  const allLabel = lang === "id" ? "Semua" : "All";
  const categories = useMemo(
    () => [
      allLabel,
      ...Array.from(new Set(newsItems.map((item) => item.category?.id ?? ""))).filter(Boolean),
    ],
    [newsItems, allLabel],
  );
  const selectedCategory = category || allLabel;
  const [featured, ...rest] = newsItems;

  const totalPages = data?.totalPages ?? 1;

  function handleCategorySelect(value: string) {
    setCategory(value === allLabel ? undefined : value);
    setPage(1);
  }

  const errorMessage = error ? handleSupabaseError(error, lang) : null;

  return (
    <SiteLayout>
      <SectionHeader
        number="01"
        eyebrow={lang === "id" ? "BERITA" : "NEWS"}
        title={t("sec_news")}
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedCategory === cat
                  ? "border-accent-red bg-accent-red text-white"
                  : "border-border bg-background text-foreground hover:border-accent-red hover:text-accent-red"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-muted-foreground">
            {lang === "id" ? "Memuat berita..." : "Loading news..."}
          </div>
        ) : isError ? (
          <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/10 p-8 py-24 text-center">
            <div className="text-rose-500">
              <div className="font-semibold">{lang === "id" ? "Gagal memuat berita" : "Unable to load news"}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {errorMessage || (lang === "id"
                  ? "Terjadi kesalahan saat mengambil data. Silakan coba lagi."
                  : "An error occurred while loading the news. Please try again.")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {lang === "id" ? "Coba Lagi" : "Try Again"}
            </button>
          </div>
        ) : !featured ? (
          <div className="py-24 text-center text-muted-foreground">
            {lang === "id" ? "Tidak ada berita." : "No news available."}
          </div>
        ) : (
          <>
            <article className="group block">
              <div className="overflow-hidden bg-muted">
                <img
                  src={featured.cover}
                  alt={featured.title[lang]}
                  className="aspect-[16/7] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs">
                <span className="bg-accent-red px-2 py-1 font-mono font-semibold uppercase tracking-wider text-white">
                  {featured.category[lang]}
                </span>
                <span className="font-mono text-muted-foreground">
                  {formatDate(featured.date, lang)}
                </span>
              </div>
              <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
                {featured.title[lang]}
              </h2>
              <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
                {featured.excerpt[lang]}
              </p>
            </article>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {rest.map((n) => (
                <article key={n.id} className="group">
                  <div className="overflow-hidden bg-muted">
                    <img
                      src={n.cover}
                      alt={n.title[lang]}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs">
                    <span className="bg-accent-red px-2 py-1 font-mono font-semibold uppercase tracking-wider text-white">
                      {n.category[lang]}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {formatDate(n.date, lang)}
                    </span>
                  </div>
                  <Link
                    to="/berita/$slug"
                    params={{ slug: String(n.slug ?? n.id ?? "") }}
                    className="mt-3 block font-display text-xl font-bold leading-tight text-foreground transition-colors hover:text-accent-red"
                  >
                    {n.title[lang]}
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">{n.excerpt[lang]}</p>
                </article>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <div className="text-sm text-muted-foreground">
                {data?.totalItems ?? 0} {lang === "id" ? "item" : "items"} · {lang === "id" ? "Halaman" : "Page"} {page} {lang === "id" ? "dari" : "of"} {totalPages}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:border-accent-red hover:text-accent-red disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {lang === "id" ? "Sebelumnya" : "Previous"}
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:border-accent-red hover:text-accent-red disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {lang === "id" ? "Selanjutnya" : "Next"}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function formatDate(iso: string, lang: "id" | "en") {
  return new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
