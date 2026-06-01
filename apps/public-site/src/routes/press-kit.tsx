import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getPocketBaseClient, getPressKit } from "@shared/pb";

export const Route = createFileRoute("/press-kit")({
  head: () => ({
    meta: [
      { title: "Press Kit — Korps Publik & Pers" },
      {
        name: "description",
        content: "Aset resmi untuk awak media: logo, panduan identitas, foto resolusi tinggi, b-roll.",
      },
    ],
  }),
  component: PressKitPage,
});

function PressKitPage() {
  const { t, lang } = useI18n();
  const pbClient = getPocketBaseClient();
  const { data } = useQuery({ queryKey: ["pressKit"], queryFn: () => getPressKit() });
  const pressKit = data?.items ?? [];

  return (
    <SiteLayout>
      <SectionHeader
        number="07"
        eyebrow="PRESS"
        title={t("sec_press_kit")}
        lead={
          lang === "id"
            ? "Aset resmi yang dapat digunakan oleh awak media. Penggunaan wajib mengikuti panduan identitas visual."
            : "Official assets available to the press. Use must comply with the visual identity guidelines."
        }
      />
      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="overflow-hidden border border-border">
          {pressKit.map((item, i) => (
            <div
              key={item.name}
              className={`flex items-center justify-between gap-4 p-5 md:p-6 ${
                i !== 0 ? "border-t border-border" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-navy text-navy-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display font-semibold">{item.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {item.type} · {item.sizeLabel}
                  </div>
                </div>
              </div>
              <a
                href={pbClient.getFileUrl(item, "fileAsset")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent-red hover:text-white hover:border-accent-red"
              >
                <Download className="h-4 w-4" /> {t("download")}
              </a>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
