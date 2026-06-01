import { useEffect, useMemo, useState } from "react";
import { getPocketBaseClient } from "@shared/pb";

type DashboardSummary = {
  totalNews: number;
  upcomingEvents: number;
  unreadMessages: number;
  activeOfficers: number;
};

const initialSummary: DashboardSummary = {
  totalNews: 0,
  upcomingEvents: 0,
  unreadMessages: 0,
  activeOfficers: 0,
};

export default function App() {
  const pb = getPocketBaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(pb.authStore.isValid);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);

  const canLogin = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password],
  );

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setAuthenticated(pb.authStore.isValid);
    });
    setAuthenticated(pb.authStore.isValid);
    return unsubscribe;
  }, [pb.authStore]);

  useEffect(() => {
    async function loadSummary() {
      if (!authenticated) return;

      setLoadingSummary(true);
      try {
        const [news, events, contacts, officers] = await Promise.all([
          pb.collection("news").getList(1, 1, { filter: "published=true" }),
          pb.collection("events").getList(1, 1, { filter: "date >= now()" }),
          pb.collection("contacts").getList(1, 1, { filter: "status = \"new\"" }),
          pb.collection("officers").getList(1, 1, { filter: "status = \"active\"" }),
        ]);

        setSummary({
          totalNews: news.totalItems,
          upcomingEvents: events.totalItems,
          unreadMessages: contacts.totalItems,
          activeOfficers: officers.totalItems,
        });
      } catch (error) {
        console.error("Failed to load admin summary", error);
      } finally {
        setLoadingSummary(false);
      }
    }

    void loadSummary();
  }, [authenticated, pb]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);
    if (!canLogin) return;

    try {
      await pb.admins.authWithPassword(email, password);
      setAuthenticated(true);
    } catch (error) {
      console.error(error);
      setAuthError("Login gagal. Periksa email dan password Anda.");
      setAuthenticated(false);
    }
  }

  function handleLogout() {
    pb.authStore.clear();
    setAuthenticated(false);
    setSummary(initialSummary);
  }

  if (!authenticated) {
    return (
      <div className="admin-shell">
        <main className="login-panel">
          <h1>Command Connect Admin</h1>
          <p>Masuk untuk mengelola berita, kegiatan, dan konten situs.</p>
          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            {authError ? <p className="auth-error">{authError}</p> : null}
            <button type="submit" disabled={!canLogin} className="button-primary">
              Login
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">Command Connect</div>
        <nav>
          <a href="#dashboard" className="active">
            Dashboard
          </a>
          <a href="#berita">Berita</a>
          <a href="#kegiatan">Kegiatan</a>
          <a href="#struktur">Struktur</a>
          <a href="#galeri">Galeri</a>
          <a href="#kontak">Kontak</a>
          <a href="#settings">Pengaturan</a>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <p>Ringkasan operasi admin dan akses cepat.</p>
          </div>
          <button className="button-secondary" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <section className="cards-grid" id="dashboard">
          <article className="card">
            <p className="card-title">Total Berita</p>
            <p className="card-value">{summary.totalNews}</p>
          </article>
          <article className="card">
            <p className="card-title">Kegiatan Mendatang</p>
            <p className="card-value">{summary.upcomingEvents}</p>
          </article>
          <article className="card">
            <p className="card-title">Pesan Masuk</p>
            <p className="card-value">{summary.unreadMessages}</p>
          </article>
          <article className="card">
            <p className="card-title">Pejabat Aktif</p>
            <p className="card-value">{summary.activeOfficers}</p>
          </article>
        </section>

        <section className="section-preview" id="berita">
          <div className="section-preview-header">
            <h2>Berita</h2>
            <p>Kelola artikel berita dengan status draft dan publikasi.</p>
          </div>
          <div className="section-preview-body">
            {loadingSummary
              ? "Memuat data berita..."
              : "Gunakan menu samping untuk masuk ke modul CRUD berita, kegiatan, struktur, galeri, dan kontak."}
          </div>
        </section>
      </main>
    </div>
  );
}
