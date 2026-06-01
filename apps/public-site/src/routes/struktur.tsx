import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getOfficers } from "@shared/pb";

export const Route = createFileRoute("/struktur")({
  head: () => ({
    meta: [
      { title: "Struktur Komando — Korps Publik & Pers" },
      {
        name: "description",
        content: "Jajaran pimpinan aktif Korps Publik & Pers beserta posisi dan masa jabatan.",
      },
    ],
  }),
  component: StrukturPage,
});

function StrukturPage() {
  const { t, lang } = useI18n();
  const { data } = useQuery({ queryKey: ["officers", "active"], queryFn: () => getOfficers("active") });
  const active = data?.items ?? [];

  return (
    <SiteLayout>
      <SectionHeader
        number="02"
        eyebrow={lang === "id" ? "STRUKTUR" : "STRUCTURE"}
        title={t("sec_leaders")}
        lead={
          lang === "id"
            ? "Daftar pejabat yang saat ini menjabat di Korps Publik & Pers. Pejabat yang telah purna atau pindah satuan dapat dilihat pada halaman Riwayat Jabatan."
            : "Current officers serving in Korps Publik & Pers. Past or transferred officers are listed on the Position History page."
        }
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {active.map((o) => (
            <article key={o.id} className="overflow-hidden border border-border bg-card">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={o.photo}
                  alt={o.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className="eyebrow text-accent-red">{o.rankCode}</span>
                  <span className="bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                    {t("active")}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight">
                  {o.rank.name[lang]} {o.name}
                </h3>
                <p className="mt-1 text-base text-muted-foreground">{o.position.name[lang]}</p>
                <div className="mt-4 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                  {lang === "id" ? "MENJABAT SEJAK" : "SERVING SINCE"} ·{" "}
                  {formatMonth(o.termStart, lang)}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-navy-foreground">
              <tr>
                <Th>{lang === "id" ? "Pangkat" : "Rank"}</Th>
                <Th>{lang === "id" ? "Nama" : "Name"}</Th>
                <Th>{lang === "id" ? "Jabatan" : "Position"}</Th>
                <Th>{lang === "id" ? "Mulai" : "Since"}</Th>
              </tr>
            </thead>
            <tbody>
              {active.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs font-semibold uppercase text-accent-red">
                    {o.rankCode}
                  </td>
                  <td className="px-4 py-3 font-semibold">{o.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.position.name[lang]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {formatMonth(o.termStart, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SiteLayout>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider">{children}</th>;
}

function formatMonth(ym: string, lang: "id" | "en") {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    month: "long",
    year: "numeric",
  });
}
