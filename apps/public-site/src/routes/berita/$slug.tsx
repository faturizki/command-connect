import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { useI18n } from "@/lib/i18n";
import { getNewsBySlug, getHoaxClaimsByNewsId } from "@shared/supabase";
import { HoaxCheckerBanner } from "@/components/ui/hoax-checker-banner";

export const Route = createFileRoute("/berita/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Berita — ${params.slug}` },
      {
        name: "description",
        content: "Baca detail rilis pers dan berita terkini Korps Publik & Pers.",
      },
    ],
  }),
  component: BeritaSlugPage,
});

function BeritaSlugPage() {
  const { lang } = useI18n();
  const params = useParams({ from: "/berita/$slug" });
  const slug = params.slug as string;
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["news", slug],
    queryFn: () => getNewsBySlug(slug),
  });

  // Fetch hoax claims for this article
  const { data: hoaxClaims, isLoading: hoaxClaimsLoading } = useQuery({
    queryKey: ["hoax-claims", data?.id],
    queryFn: () => getHoaxClaimsByNewsId(data!.id),
    enabled: !!data?.id,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-px mx-auto max-w-7xl py-24 text-center text-muted-foreground">
          Loading article...
        </div>
      </SiteLayout>
    );
  }

  if (isError || !data) {
    return (
      <SiteLayout>
        <div className="container-px mx-auto max-w-7xl py-24 text-center text-rose-500">
          Artikel tidak ditemukan.
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-px mx-auto max-w-5xl pb-24">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-muted">
            <img
              src={data.cover}
              alt={data.title[lang] ?? data.title?.en ?? "News article"}
              className="w-full object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="bg-accent-red px-2 py-1 font-mono font-semibold uppercase tracking-wider text-white">
              {data.category?.[lang] ?? data.category?.en ?? "News"}
            </span>
            <span className="font-mono text-muted-foreground">
              {formatDate(data.date, lang)}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            {data.title?.[lang] ?? data.title?.en}
          </h1>
          <div className="prose prose-invert max-w-none text-base text-muted-foreground">
            <p>{data.excerpt?.[lang] ?? data.excerpt?.en}</p>
          </div>
        </div>

        {/* Hoax Checker Banner - displays if hoax claims exist for this article */}
        {!hoaxClaimsLoading && hoaxClaims && hoaxClaims.length > 0 && (
          <div className="mt-12 border-t border-border pt-12">
            <h2 className="mb-8 font-display text-2xl font-bold">
              {lang === "id" ? "Klarifikasi Berita" : "Fact Check"}
            </h2>
            <div className="space-y-8">
              {hoaxClaims.map((claim) => (
                <HoaxCheckerBanner key={claim.id} claim={claim} />
              ))}
            </div>
          </div>
        )}
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
