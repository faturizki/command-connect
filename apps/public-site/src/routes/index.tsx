import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Calendar, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-hq.jpg";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getEvents, getNews, getOfficers } from "@shared/pb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Korps Publik & Pers — Pusat Penerangan Resmi" },
      {
        name: "description",
        content:
          "Saluran komunikasi resmi Korps Publik & Pers: rilis pers, kegiatan, struktur komando, dan press kit.",
      },
      { property: "og:title", content: "Korps Publik & Pers" },
      {
        property: "og:description",
        content: "Pusat Penerangan resmi — transparan, profesional, dapat diakses 24 jam.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const newsQuery = useQuery({ queryKey: ["news", lang], queryFn: () => getNews(lang, 1, 3) });
  const eventsQuery = useQuery({ queryKey: ["events", "upcoming"], queryFn: () => getEvents(true) });
  const officersQuery = useQuery({ queryKey: ["officers", "active"], queryFn: () => getOfficers("active") });

  const activeLeaders = officersQuery.data?.items ?? [];
  const upcoming = [...(eventsQuery.data?.items ?? [])].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2);
  const topNews = newsQuery.data?.items ?? [];

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-navy-deep text-navy-foreground">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            width={1600}
            height={1024}
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/40" />
        </div>
        <div className="container-px relative mx-auto max-w-7xl py-20 md:py-32">
          <div className="section-divider mb-6">
            <span className="eyebrow text-white/80">{t("hero_eyebrow")}</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.02] sm:text-5xl md:text-7xl lg:text-[5.5rem]">
            {t("hero_title_1")}
            <br />
            {t("hero_title_2")}
            <br />
            {t("hero_title_3")}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            {t("hero_sub")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/berita"
              className="inline-flex items-center gap-2 bg-accent-red px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
            >
              {t("cta_latest")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/struktur"
              className="inline-flex items-center gap-2 border border-white/40 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
            >
              {t("cta_structure")}
            </Link>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="container-px mx-auto max-w-7xl py-20 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="section-divider mb-4">
              <span className="eyebrow">01 / {lang === "id" ? "BERITA" : "NEWS"}</span>
            </div>
            <h2 className="font-display text-3xl font-bold md:text-5xl">{t("sec_news")}</h2>
          </div>
          <Link
            to="/berita"
            className="hidden items-center gap-2 text-sm font-semibold text-accent-red hover:gap-3 md:inline-flex"
          >
            {t("view_all")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {topNews.map((n, i) => (
            <Link
              key={n.id}
              to="/berita/$slug"
              params={{ slug: String(n.slug ?? n.id ?? "") }}
              className={`group block ${i === 0 ? "md:col-span-3" : ""}`}
            >
              <div className="overflow-hidden bg-muted">
                <img
                  src={n.cover}
                  alt={n.title[lang]}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    i === 0 ? "aspect-[16/7]" : "aspect-[4/3]"
                  }`}
                  loading={i === 0 ? "eager" : "lazy"}
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
              <h3
                className={`mt-3 font-display font-bold leading-tight ${
                  i === 0 ? "text-2xl md:text-4xl" : "text-xl"
                }`}
              >
                {n.title[lang]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {n.excerpt[lang]}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section className="bg-secondary">
        <div className="container-px mx-auto max-w-7xl py-20 md:py-28">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="section-divider mb-4">
                <span className="eyebrow">02 / {lang === "id" ? "KEGIATAN" : "EVENTS"}</span>
              </div>
              <h2 className="font-display text-3xl font-bold md:text-5xl">
                {t("sec_events")}
              </h2>
            </div>
            <Link
              to="/kegiatan"
              className="hidden items-center gap-2 text-sm font-semibold text-accent-red hover:gap-3 md:inline-flex"
            >
              {t("view_all")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {upcoming.map((e) => {
              const d = new Date(e.date);
              return (
                <article
                  key={e.id}
                  className="group overflow-hidden border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={e.cover}
                      alt={e.title[lang]}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute right-4 top-4 bg-accent-red px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                      {e.category[lang]}
                    </div>
                    <div className="absolute left-4 top-4 flex h-16 w-16 flex-col items-center justify-center bg-white text-foreground shadow-md">
                      <div className="font-display text-2xl font-bold leading-none">
                        {d.getDate().toString().padStart(2, "0")}
                      </div>
                      <div className="eyebrow mt-1 text-[9px]">
                        {monthShort(d, lang)}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold leading-tight">
                      {e.title[lang]}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-accent-red" /> {e.location[lang]}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEASE */}
      <section className="container-px mx-auto max-w-7xl py-20 md:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="section-divider mb-4">
              <span className="eyebrow">03 / {lang === "id" ? "PIMPINAN" : "LEADERSHIP"}</span>
            </div>
            <h2 className="font-display text-3xl font-bold md:text-5xl">{t("sec_leaders")}</h2>
          </div>
          <Link
            to="/struktur"
            className="hidden items-center gap-2 text-sm font-semibold text-accent-red hover:gap-3 md:inline-flex"
          >
            {t("view_all")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeLeaders.map((o) => (
            <article key={o.id} className="border border-border bg-card">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={o.photo}
                  alt={o.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="eyebrow text-accent-red">{o.rankCode}</div>
                <h3 className="mt-2 font-display text-xl font-bold leading-tight">
                  {o.rank.name[lang]} {o.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{o.position.name[lang]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="bg-navy text-navy-foreground">
        <div className="container-px mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center">
          <div>
            <div className="eyebrow text-white/70">{t("sec_contact")}</div>
            <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              {t("contact_lead")}
            </h3>
          </div>
          <Link
            to="/kontak"
            className="inline-flex items-center gap-2 bg-accent-red px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white"
          >
            {t("nav_contact")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function formatDate(iso: string, lang: "id" | "en") {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function monthShort(d: Date, lang: "id" | "en") {
  return d
    .toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short" })
    .toUpperCase();
}

// keep icon reference to avoid unused import warning when shaking
void Calendar;
