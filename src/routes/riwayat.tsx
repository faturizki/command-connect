import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { officers } from "@/lib/mock-data";

export const Route = createFileRoute("/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Jabatan — Korps Publik & Pers" },
      {
        name: "description",
        content: "Catatan pejabat yang telah purna tugas atau pindah satuan di Korps Publik & Pers.",
      },
    ],
  }),
  component: RiwayatPage,
});

function RiwayatPage() {
  const { t, lang } = useI18n();
  const past = [...officers.filter((o) => o.status === "past")].sort((a, b) =>
    (b.termEnd ?? "").localeCompare(a.termEnd ?? "")
  );

  return (
    <SiteLayout>
      <SectionHeader
        number="04"
        eyebrow={lang === "id" ? "ARSIP" : "ARCHIVE"}
        title={t("sec_history")}
        lead={
          lang === "id"
            ? "Daftar pejabat yang telah menyelesaikan masa tugas atau berpindah satuan, diurutkan dari yang terbaru."
            : "Officers who have completed their term or transferred to other units, sorted by most recent."
        }
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
        <ol className="relative border-l border-border pl-8">
          {past.map((o) => (
            <li key={o.id} className="mb-12 last:mb-0">
              <span className="absolute -left-[7px] mt-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-red ring-4 ring-background" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-border bg-muted">
                  <img
                    src={o.photo}
                    alt={o.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="eyebrow text-accent-red">{o.rankCode}</span>
                    <span className="bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("past")}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold">
                    {o.rank[lang]} {o.name}
                  </h3>
                  <p className="text-muted-foreground">{o.position[lang]}</p>
                  <div className="mt-3 font-mono text-xs text-muted-foreground">
                    {formatMonth(o.termStart, lang)} —{" "}
                    {o.termEnd ? formatMonth(o.termEnd, lang) : (lang === "id" ? "Sekarang" : "Present")}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </SiteLayout>
  );
}

function formatMonth(ym: string, lang: "id" | "en") {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    month: "long",
    year: "numeric",
  });
}
