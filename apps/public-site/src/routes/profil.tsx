import { createFileRoute } from "@tanstack/react-router";
import { Target, Compass, ShieldCheck } from "lucide-react";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil Satuan — Korps Publik & Pers" },
      {
        name: "description",
        content: "Mandat, visi, dan misi Korps Publik & Pers sebagai pusat penerangan resmi.",
      },
    ],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const { t, lang } = useI18n();

  const mission =
    lang === "id"
      ? [
          "Menyampaikan informasi resmi secara akurat, cepat, dan dapat dipertanggungjawabkan.",
          "Membangun hubungan profesional dengan media nasional dan internasional.",
          "Mengelola dokumentasi visual dan tertulis kegiatan satuan.",
          "Mendukung transparansi dan kepercayaan publik melalui kanal digital.",
        ]
      : [
          "Deliver accurate, timely, and accountable official information.",
          "Build professional relations with national and international media.",
          "Manage visual and written documentation of unit activities.",
          "Support public trust and transparency through digital channels.",
        ];

  return (
    <SiteLayout>
      <SectionHeader
        number="08"
        eyebrow={lang === "id" ? "PROFIL" : "PROFILE"}
        title={t("sec_profile")}
        lead={t("profile_lead")}
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            icon={<Target className="h-5 w-5" />}
            label={t("vision")}
            title={
              lang === "id"
                ? "Menjadi pusat komunikasi militer yang paling dipercaya."
                : "To become the most trusted military communications center."
            }
          />
          <Card
            icon={<Compass className="h-5 w-5" />}
            label={lang === "id" ? "Mandat" : "Mandate"}
            title={
              lang === "id"
                ? "Mengelola informasi resmi & hubungan media satuan."
                : "Manage official information and media relations."
            }
          />
          <Card
            icon={<ShieldCheck className="h-5 w-5" />}
            label={lang === "id" ? "Nilai" : "Values"}
            title={
              lang === "id"
                ? "Profesional · Transparan · Akurat · Disiplin."
                : "Professional · Transparent · Accurate · Disciplined."
            }
          />
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_2fr]">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t("mission")}</h2>
          <ol className="space-y-5">
            {mission.map((m, i) => (
              <li key={i} className="flex gap-4 border-b border-border pb-5">
                <span className="font-display text-xl font-bold text-accent-red">
                  0{i + 1}
                </span>
                <p className="text-base leading-relaxed">{m}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </SiteLayout>
  );
}

function Card({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <div className="border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center bg-navy text-navy-foreground">
        {icon}
      </div>
      <div className="eyebrow mt-5 text-accent-red">{label}</div>
      <h3 className="mt-2 font-display text-lg font-bold leading-snug">{title}</h3>
    </div>
  );
}
