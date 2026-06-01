import { useMemo, useState } from "react";

const dashboardCards = [
  { title: "Total Berita", value: 42 },
  { title: "Kegiatan Mendatang", value: 8 },
  { title: "Pesan Masuk", value: 13 },
  { title: "Pejabat Aktif", value: 5 },
];

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const canLogin = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canLogin) return;
    setAuthenticated(true);
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
          <button className="button-secondary" onClick={() => setAuthenticated(false)}>
            Logout
          </button>
        </header>

        <section className="cards-grid" id="dashboard">
          {dashboardCards.map((card) => (
            <article key={card.title} className="card">
              <p className="card-title">{card.title}</p>
              <p className="card-value">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="section-preview" id="berita">
          <div className="section-preview-header">
            <h2>Berita</h2>
            <p>Kelola artikel berita dengan status draft dan publikasi.</p>
          </div>
          <div className="section-preview-body">Placeholder untuk list berita admin.</div>
        </section>
      </main>
    </div>
  );
}
