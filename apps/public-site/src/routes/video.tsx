import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, SectionHeader } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getVideos } from "@shared/supabase";
import { VideoGallery } from "@/components/ui/video-gallery";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "Video — Korps Publik & Pers" },
      {
        name: "description",
        content: "Koleksi video dokumentasi, kampanye, dan siaran resmi Korps Publik & Pers.",
      },
    ],
  }),
  component: VideoPage,
});

function VideoPage() {
  const { t, lang } = useI18n();
  const [page, setPage] = React.useState(1);
  const perPage = 12;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["videos", page],
    queryFn: () => getVideos(page, perPage),
    retry: 2,
  });

  const videos = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <SiteLayout>
      <SectionHeader
        number="07"
        eyebrow={lang === "id" ? "VIDEO" : "VIDEOS"}
        title={t("sec_video") || (lang === "id" ? "Video Dokumentasi" : "Video Documentation")}
        lead={
          lang === "id"
            ? "Koleksi video dokumentasi, kampanye, dan siaran resmi."
            : "Collection of video documentation, campaigns, and official broadcasts."
        }
      />

      <section className="container-px mx-auto max-w-7xl pb-24">
        {isLoading ? (
          <div className="py-24 text-center text-muted-foreground">
            {lang === "id" ? "Memuat video..." : "Loading videos..."}
          </div>
        ) : isError ? (
          <div className="py-24 text-center text-rose-500">
            {lang === "id" ? "Gagal memuat video." : "Unable to load videos."}
          </div>
        ) : videos.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            {lang === "id" ? "Belum ada video." : "No videos available."}
          </div>
        ) : (
          <>
            <VideoGallery videos={videos} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4 md:flex-row md:justify-between">
                <div className="text-sm text-muted-foreground">
                  {data?.totalItems ?? 0} {lang === "id" ? "video" : "videos"} · {lang === "id" ? "Halaman" : "Page"}{" "}
                  {page} {lang === "id" ? "dari" : "of"} {totalPages}
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
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}
