import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getGallery } from "@shared/supabase";

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
  const { data } = useQuery({ queryKey: ["gallery"], queryFn: () => getGallery() });
  const gallery = data?.items ?? [];

  return (
    <SiteLayout>
      <SectionHeader
        number="06"
        eyebrow={lang === "id" ? "GALERI" : "GALLERY"}
        title={t("sec_gallery")}
      />
      <section className="container-px mx-auto max-w-7xl pb-24">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {gallery.map((item, i) => (
            <figure
              key={item.id ?? `${item.image}-${i}`}
              className={`overflow-hidden bg-muted ${
                i % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
              }`}
            >
              <img
                src={item.image}
                alt={item.caption?.[lang] ?? item.caption?.en ?? `Dokumentasi ${i + 1}`}
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
