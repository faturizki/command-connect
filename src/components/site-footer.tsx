import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-navy-deep text-navy-foreground">
      <div className="container-px mx-auto max-w-7xl py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="font-display text-base font-bold">{t("brand_name")}</div>
                <div className="eyebrow text-[10px] text-white/60">{t("brand_sub")}</div>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
              {t("footer_disclaimer")}
            </p>
          </div>
          <FooterCol
            title={t("nav_news")}
            links={[
              { to: "/berita", label: t("nav_news") },
              { to: "/kegiatan", label: t("nav_events") },
              { to: "/galeri", label: t("nav_gallery") },
              { to: "/press-kit", label: t("nav_press_kit") },
            ]}
          />
          <FooterCol
            title={t("nav_profile")}
            links={[
              { to: "/struktur", label: t("nav_structure") },
              { to: "/riwayat", label: t("nav_history") },
              { to: "/profil", label: t("nav_profile") },
              { to: "/kontak", label: t("nav_contact") },
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center">
          <div>© {year} {t("brand_name")}. {t("footer_rights")}</div>
          <div className="eyebrow text-[10px]">PUSAT PENERANGAN · OFFICIAL</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <div className="eyebrow mb-4 text-white/60">{title}</div>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-white/85 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
