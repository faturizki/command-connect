import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { news } from "@/lib/mock-data";

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
  const [featured, ...rest] = news;

  return (
    <SiteLayout>
      <SectionHeader
        number="01"
        eyebrow={lang === "id" ? "BERITA" : "NEWS"}
        title={t("sec_news")}
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
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
              <h3 className="mt-3 font-display text-xl font-bold leading-tight">
                {n.title[lang]}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{n.excerpt[lang]}</p>
            </article>
          ))}
        </div>
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
