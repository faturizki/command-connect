import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SectionHeader({
  number,
  eyebrow,
  title,
  lead,
}: {
  number?: string;
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="container-px mx-auto max-w-7xl pt-16 pb-10 md:pt-24 md:pb-14">
      <div className="section-divider mb-5">
        <span className="eyebrow">
          {number ? `${number} / ` : ""}
          {eyebrow}
        </span>
      </div>
      <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-6xl">{title}</h1>
      {lead && (
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{lead}</p>
      )}
    </div>
  );
}
