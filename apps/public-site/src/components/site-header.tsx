import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", key: "nav_home" as const },
  { to: "/struktur", key: "nav_structure" as const },
  { to: "/riwayat", key: "nav_history" as const },
  { to: "/kegiatan", key: "nav_events" as const },
  { to: "/berita", key: "nav_news" as const },
  { to: "/search", key: "nav_search" as const },
  { to: "/galeri", key: "nav_gallery" as const },
  { to: "/video", key: "nav_videos" as const },
  { to: "/press-kit", key: "nav_press_kit" as const },
  { to: "/profil", key: "nav_profile" as const },
  { to: "/kontak", key: "nav_contact" as const },
];

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy text-navy-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold tracking-tight">
              {t("brand_name")}
            </div>
            <div className="eyebrow text-[10px] text-muted-foreground">
              {t("brand_sub")}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                  active ? "text-accent-red" : "text-muted-foreground"
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle lang={lang} setLang={setLang} />
          <button
            type="button"
            aria-label="Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-px mx-auto flex max-w-7xl flex-col py-4">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "border-b border-border/60 py-4 text-base font-medium",
                    active ? "text-accent-red" : "text-foreground"
                  )}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border border-border p-0.5 text-xs font-semibold">
      {(["id", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={cn(
            "rounded-[6px] px-2.5 py-1.5 uppercase tracking-wider transition-colors",
            lang === l ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
