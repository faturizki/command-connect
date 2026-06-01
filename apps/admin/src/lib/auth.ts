import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient, getTenantId } from "@shared/supabase";
import { getCurrentTenantSlug } from "@shared/tenant";

export type AdminRole = "admin" | "editor" | "viewer";

export interface AdminAuthState {
  session: Session | null;
  role: AdminRole | null;
  tenantId: string | null;
  tenantSlug: string;
  loading: boolean;
  error: string | null;
}

export async function adminSignIn(email: string, password: string): Promise<AdminRole> {
  const supabase = getSupabaseClient();
  const tenantSlug = getCurrentTenantSlug();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const userId = data?.user?.id;
  if (!userId) {
    await supabase.auth.signOut();
    throw new Error("Gagal masuk: user tidak ditemukan.");
  }

  const tenantId = await getTenantId(tenantSlug);
  const { data: access, error: accessError } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (accessError || !access?.role) {
    await supabase.auth.signOut();
    throw new Error(`Akun ini tidak memiliki akses ke '${tenantSlug}'. Hubungi administrator.`);
  }

  return access.role as AdminRole;
}

export async function adminSignOut(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

export function useAdminAuth(): AdminAuthState {
  const tenantSlug = getCurrentTenantSlug();
  const [state, setState] = useState<AdminAuthState>({
    session: null,
    role: null,
    tenantId: null,
    tenantSlug,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session) {
          if (!cancelled) {
            setState((current) => ({ ...current, session: null, role: null, tenantId: null, loading: false, error: null }));
          }
          return;
        }

        const tenantId = await getTenantId(tenantSlug);
        const { data: access, error: accessError } = await supabase
          .from("tenant_users")
          .select("role")
          .eq("tenant_id", tenantId)
          .eq("user_id", session.user.id)
          .single();

        if (!cancelled) {
          setState({
            session,
            role: (access?.role as AdminRole) ?? null,
            tenantId,
            tenantSlug,
            loading: false,
            error: access ? null : accessError?.message ?? "Tidak ada akses ke tenant ini",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            session: null,
            role: null,
            tenantId: null,
            loading: false,
            error: err instanceof Error ? err.message : "Terjadi kesalahan autentikasi",
          }));
        }
      }
    }

    loadSession();

    const supabase = getSupabaseClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      if (!session) {
        setState({ session: null, role: null, tenantId: null, tenantSlug, loading: false, error: null });
        return;
      }
      await loadSession();
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [tenantSlug]);

  return state;
}
