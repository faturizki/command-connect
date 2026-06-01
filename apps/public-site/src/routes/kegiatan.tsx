import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getEvents } from "@shared/supabase";

export const Route = createFileRoute("/kegiatan")({
  head: () => ({
    meta: [
      { title: "Kegiatan & Event — Korps Publik & Pers" },
      {
        name: "description",
        content: "Agenda kegiatan publik: pelatihan, lomba, open house, dan bakti sosial.",
      },
    ],
  }),
  component: KegiatanPage,
});

function KegiatanPage() {
  const { t, lang } = useI18n();
  const { data } = useQuery({ queryKey: ["events"], queryFn: () => getEvents() });
  const sorted = [...(data?.items ?? [])].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <SiteLayout>
      <SectionHeader
        number="05"
        eyebrow={lang === "id" ? "AGENDA" : "AGENDA"}
        title={t("sec_events")}
        lead={
          lang === "id"
            ? "Kegiatan yang diselenggarakan satuan dan terbuka bagi publik atau awak media."
            : "Events organized by the unit, open to the public or media."
        }
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="grid gap-8">
          {sorted.map((e) => {
            const d = new Date(e.date);
            return (
              <article
                key={e.id}
                className="group grid overflow-hidden border border-border bg-card md:grid-cols-[1.2fr_1fr]"
              >
                <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
                  <img
                    src={e.cover}
                    alt={e.title[lang]}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute right-4 top-4 bg-accent-red px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                    {e.category[lang]}
                  </div>
                  <div className="absolute left-4 top-4 flex h-20 w-20 flex-col items-center justify-center bg-white text-foreground shadow-md">
                    <div className="font-display text-3xl font-bold leading-none">
                      {d.getDate().toString().padStart(2, "0")}
                    </div>
                    <div className="eyebrow mt-1 text-[9px]">{monthShort(d, lang)}</div>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8">
                  <div className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatFullDate(e.date, lang)}
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
                    {e.title[lang]}
                  </h3>
                  <p className="mt-3 text-muted-foreground">{e.excerpt[lang]}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-accent-red" />
                    {e.location[lang]}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}

function monthShort(d: Date, lang: "id" | "en") {
  return d
    .toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short" })
    .toUpperCase();
}
function formatFullDate(iso: string, lang: "id" | "en") {
  return new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
