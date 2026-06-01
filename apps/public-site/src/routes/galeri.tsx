import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { gallery } from "@/lib/mock-data";

export const Route = createFileRoute("/galeri")({
  head: () => ({
    meta: [
      { title: "Galeri Dokumentasi — Korps Publik & Pers" },
      { name: "description", content: "Dokumentasi visual kegiatan, operasi, dan pelatihan." },
    ],
  }),
  component: GaleriPage,
});

function GaleriPage() {
  const { t, lang } = useI18n();
  return (
    <SiteLayout>
      <SectionHeader
        number="06"
        eyebrow={lang === "id" ? "GALERI" : "GALLERY"}
        title={t("sec_gallery")}
      />
      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {gallery.map((src, i) => (
            <figure
              key={src + i}
              className={`overflow-hidden bg-muted ${
                i % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
              }`}
            >
              <img
                src={src}
                alt={`Dokumentasi ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </figure>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
