/**
 * Ekstrak tenant slug dari hostname.
 * clienta.infopers.web.id → 'clienta'
 * infopers.web.id          → null (root domain)
 * localhost:5173            → 'demo' (dev fallback)
 */
function getConfiguredTenantRoots(): string[] {
  const envValues = import.meta.env.VITE_TENANT_ROOT_DOMAINS?.split(",") ?? [];
  const roots = envValues.map((value) => value.trim()).filter(Boolean);
  return roots.length > 0 ? roots : ["infopers.web.id", "infopers.biz.id"];
}

export function getTenantSlug(hostname: string): string | null {
  if (hostname.startsWith("localhost") || hostname.startsWith("127.")) {
    return import.meta.env.VITE_DEV_TENANT ?? "demo";
  }

  const knownRoots = getConfiguredTenantRoots();

  for (const root of knownRoots) {
    if (hostname === root) return null;
    if (hostname.endsWith(`.${root}`)) {
      const sub = hostname.slice(0, -(root.length + 1));
      if (!sub.includes(".")) return sub;
    }
  }

  return null;
}

/**
 * Untuk dipakai di browser (admin SPA dan client-side public site)
 */
export function getCurrentTenantSlug(): string {
  if (typeof window === "undefined") return import.meta.env.VITE_DEV_TENANT ?? "demo";
  return getTenantSlug(window.location.hostname) ?? "demo";
}
