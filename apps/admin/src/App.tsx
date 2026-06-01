import { useEffect, useMemo, useState } from "react";
import type { ContactMessage, EventItem, GalleryItem, NewsArticle, Officer, PressKitItem } from "@shared/types";
import { getCurrentTenantSlug } from "@shared/tenant";
import {
  adminSignIn,
  adminSignOut,
  createEvent,
  createNews,
  createOfficer,
  createGalleryItem,
  createPressKitItem,
  deleteEvent,
  deleteGalleryItem,
  deleteNews,
  deleteOfficer,
  deletePressKitItem,
  getContactMessages,
  getEventsAdminList,
  getGalleryAdminList,
  getNewsAdminList,
  getOfficersAdminList,
  getPressKitAdminList,
  markContactRead,
  updateEvent,
  updateGalleryItem,
  updateNews,
  updateOfficer,
  updatePressKitItem,
} from "@shared/supabase";
import { useAdminAuth } from "./lib/auth";

type DashboardSummary = {
  totalNews: number;
  upcomingEvents: number;
  unreadMessages: number;
  activeOfficers: number;
};

type AdminSection = "dashboard" | "berita" | "kegiatan" | "struktur" | "galeri" | "presskit" | "kontak" | "settings";

const initialSummary: DashboardSummary = {
  totalNews: 0,
  upcomingEvents: 0,
  unreadMessages: 0,
  activeOfficers: 0,
};

const emptyNewsDraft: NewsArticle = {
  title: { id: "", en: "" },
  excerpt: { id: "", en: "" },
  body: { id: "", en: "" },
  cover: "",
  category: { id: "", en: "" },
  date: new Date().toISOString().slice(0, 10),
  published: false,
};

const emptyEventDraft: EventItem = {
  title: { id: "", en: "" },
  excerpt: { id: "", en: "" },
  date: new Date().toISOString().slice(0, 10),
  location: { id: "", en: "" },
  cover: "",
  category: { id: "", en: "" },
  finished: false,
};

const emptyOfficerDraft: Officer = {
  rank_code: "",
  rank: { code: "", name: { id: "", en: "" } },
  name: "",
  position: {
    name: { id: "", en: "" },
    division: { id: "", en: "" },
  },
  photo: "",
  status: "active",
  term_start: new Date().toISOString().slice(0, 10),
  term_end: new Date().toISOString().slice(0, 10),
  bio: { id: "", en: "" },
};

const emptyGalleryDraft: GalleryItem = {
  image: "",
  caption: { id: "", en: "" },
  taken_at: new Date().toISOString().slice(0, 10),
  order: 0,
};

const emptyPressKitDraft: PressKitItem = {
  name: "",
  file_asset: "",
  size_label: "",
  type: "",
  order: 0,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const { session, role, tenantId, tenantSlug, loading: authLoading, error: authError } = useAdminAuth();
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [section, setSection] = useState<AdminSection>("dashboard");

  const [newsPage, setNewsPage] = useState(1);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsTotal, setNewsTotal] = useState(0);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsEditorVisible, setNewsEditorVisible] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsArticle | null>(null);
  const [newsDraft, setNewsDraft] = useState<NewsArticle>(emptyNewsDraft);
  const [newsSaving, setNewsSaving] = useState(false);
  const [newsSaveError, setNewsSaveError] = useState<string | null>(null);

  const [eventPage, setEventPage] = useState(1);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventEditorVisible, setEventEditorVisible] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [eventDraft, setEventDraft] = useState<EventItem>(emptyEventDraft);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventSaveError, setEventSaveError] = useState<string | null>(null);

  const [officersPage, setOfficersPage] = useState(1);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officersTotal, setOfficersTotal] = useState(0);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [officersError, setOfficersError] = useState<string | null>(null);
  const [officerEditorVisible, setOfficerEditorVisible] = useState(false);
  const [activeOfficer, setActiveOfficer] = useState<Officer | null>(null);
  const [officerDraft, setOfficerDraft] = useState<Officer>(emptyOfficerDraft);
  const [officerSaving, setOfficerSaving] = useState(false);
  const [officerSaveError, setOfficerSaveError] = useState<string | null>(null);

  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryEditorVisible, setGalleryEditorVisible] = useState(false);
  const [activeGalleryItem, setActiveGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryDraft, setGalleryDraft] = useState<GalleryItem>(emptyGalleryDraft);
  const [gallerySaving, setGallerySaving] = useState(false);
  const [gallerySaveError, setGallerySaveError] = useState<string | null>(null);

  const [pressKitPage, setPressKitPage] = useState(1);
  const [pressKitItems, setPressKitItems] = useState<PressKitItem[]>([]);
  const [pressKitTotal, setPressKitTotal] = useState(0);
  const [pressKitLoading, setPressKitLoading] = useState(false);
  const [pressKitError, setPressKitError] = useState<string | null>(null);
  const [pressKitEditorVisible, setPressKitEditorVisible] = useState(false);
  const [activePressKitItem, setActivePressKitItem] = useState<PressKitItem | null>(null);
  const [pressKitDraft, setPressKitDraft] = useState<PressKitItem>(emptyPressKitDraft);
  const [pressKitSaving, setPressKitSaving] = useState(false);
  const [pressKitSaveError, setPressKitSaveError] = useState<string | null>(null);

  const [contactsPage, setContactsPage] = useState(1);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  const canLogin = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password],
  );

  useEffect(() => {
    if (!session || !role) return;

    async function loadSummary() {
      setLoadingSummary(true);
      try {
        const [newsCount, eventsCount, contactsCount, officersCount] = await Promise.all([
          getNewsAdminList(1, 1, true),
          getEventsAdminList(1, 1, true),
          getContactMessages(1, 1, "new"),
          getOfficersAdminList(1, 1, "active"),
        ]);

        setSummary({
          totalNews: newsCount.totalItems,
          upcomingEvents: eventsCount.totalItems,
          unreadMessages: contactsCount.totalItems,
          activeOfficers: officersCount.totalItems,
        });
      } catch (error) {
        console.error("Failed to load admin summary", error);
      } finally {
        setLoadingSummary(false);
      }
    }

    void loadSummary();
  }, [session, role]);

  useEffect(() => {
    if (!session || !role) return;

    async function loadNewsList() {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const response = await getNewsAdminList(newsPage, 10);
        setNews(response.items as NewsArticle[]);
        setNewsTotal(response.totalItems);
      } catch (error) {
        console.error("Failed to load news list", error);
        setNewsError("Tidak dapat memuat daftar berita.");
      } finally {
        setNewsLoading(false);
      }
    }

    async function loadEventsList() {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const response = await getEventsAdminList(eventPage, 10);
        setEvents(response.items as EventItem[]);
        setEventsTotal(response.totalItems);
      } catch (error) {
        console.error("Failed to load events list", error);
        setEventsError("Tidak dapat memuat daftar kegiatan.");
      } finally {
        setEventsLoading(false);
      }
    }

    async function loadOfficersList() {
      setOfficersLoading(true);
      setOfficersError(null);
      try {
        const response = await getOfficersAdminList(officersPage, 10);
        setOfficers(response.items as Officer[]);
        setOfficersTotal(response.totalItems);
      } catch (error) {
        console.error("Failed to load officers list", error);
        setOfficersError("Tidak dapat memuat daftar pejabat.");
      } finally {
        setOfficersLoading(false);
      }
    }

    async function loadGalleryList() {
      setGalleryLoading(true);
      setGalleryError(null);
      try {
        const response = await getGalleryAdminList(galleryPage, 10);
        setGalleryItems(response.items as GalleryItem[]);
        setGalleryTotal(response.totalItems);
      } catch (error) {
        console.error("Failed to load gallery list", error);
        setGalleryError("Tidak dapat memuat galeri.");
      } finally {
        setGalleryLoading(false);
      }
    }

    async function loadPressKitList() {
      setPressKitLoading(true);
      setPressKitError(null);
      try {
        const response = await getPressKitAdminList(pressKitPage, 10);
        setPressKitItems(response.items as PressKitItem[]);
        setPressKitTotal(response.totalItems);
      } catch (error) {
        console.error("Failed to load press kit list", error);
        setPressKitError("Tidak dapat memuat press kit.");
      } finally {
        setPressKitLoading(false);
      }
    }

    async function loadContactInbox() {
      setContactsLoading(true);
      setContactsError(null);
      try {
        const response = await getContactMessages(contactsPage, 15);
        setContacts(response.items);
        setContactsTotal(response.totalItems);
      } catch (error) {
        console.error("Failed to load contact messages", error);
        setContactsError("Tidak dapat memuat pesan kontak.");
      } finally {
        setContactsLoading(false);
      }
    }

    switch (section) {
      case "berita":
        void loadNewsList();
        break;
      case "kegiatan":
        void loadEventsList();
        break;
      case "struktur":
        void loadOfficersList();
        break;
      case "galeri":
        void loadGalleryList();
        break;
      case "presskit":
        void loadPressKitList();
        break;
      case "kontak":
        void loadContactInbox();
        break;
      default:
        break;
    }
  }, [session, role, section, newsPage, eventPage, officersPage, galleryPage, pressKitPage, contactsPage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    if (!canLogin) return;

    try {
      await adminSignIn(email, password);
      setSection("dashboard");
    } catch (error) {
      console.error(error);
      setLoginError("Login gagal. Periksa email dan password Anda.");
    }
  }

  async function handleLogout() {
    try {
      await adminSignOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
    setSummary(initialSummary);
    setSection("dashboard");
  }

  function openNewsEditor(newsItem?: NewsArticle) {
    if (newsItem) {
      setActiveNews(newsItem);
      setNewsDraft({ ...newsItem });
    } else {
      setActiveNews(null);
      setNewsDraft(emptyNewsDraft);
    }
    setNewsEditorVisible(true);
  }

  function closeNewsEditor() {
    setNewsEditorVisible(false);
    setActiveNews(null);
    setNewsDraft(emptyNewsDraft);
    setNewsSaveError(null);
  }

  async function saveNewsArticle() {
    setNewsSaving(true);
    setNewsSaveError(null);

    try {
      if (activeNews?.id) {
        await updateNews(activeNews.id, newsDraft);
      } else {
        await createNews(newsDraft);
      }
      setNewsPage(1);
      setSection("berita");
      setNewsEditorVisible(false);
      setActiveNews(null);
      setNewsDraft(emptyNewsDraft);
    } catch (error) {
      console.error("Failed to save news", error);
      setNewsSaveError("Gagal menyimpan berita. Periksa data dan coba lagi.");
    } finally {
      setNewsSaving(false);
    }
  }

  async function handleDeleteNews(id: string) {
    const confirmed = window.confirm("Hapus berita ini?");
    if (!confirmed) return;

    try {
      await deleteNews(id);
      setNews((prev) => prev.filter((item) => item.id !== id));
      setNewsTotal((prev) => Math.max(prev - 1, 0));
      if (activeNews?.id === id) {
        closeNewsEditor();
      }
    } catch (error) {
      console.error("Failed to delete news", error);
      alert("Gagal menghapus berita.");
    }
  }

  function openEventEditor(eventItem?: EventItem) {
    if (eventItem) {
      setActiveEvent(eventItem);
      setEventDraft({ ...eventItem });
    } else {
      setActiveEvent(null);
      setEventDraft(emptyEventDraft);
    }
    setEventEditorVisible(true);
  }

  function closeEventEditor() {
    setEventEditorVisible(false);
    setActiveEvent(null);
    setEventDraft(emptyEventDraft);
    setEventSaveError(null);
  }

  async function saveEvent() {
    setEventSaving(true);
    setEventSaveError(null);

    try {
      if (activeEvent?.id) {
        await updateEvent(activeEvent.id, eventDraft);
      } else {
        await createEvent(eventDraft);
      }
      setEventPage(1);
      setSection("kegiatan");
      setEventEditorVisible(false);
      setActiveEvent(null);
      setEventDraft(emptyEventDraft);
    } catch (error) {
      console.error("Failed to save event", error);
      setEventSaveError("Gagal menyimpan kegiatan. Periksa data dan coba lagi.");
    } finally {
      setEventSaving(false);
    }
  }

  async function handleDeleteEvent(id: string) {
    const confirmed = window.confirm("Hapus kegiatan ini?");
    if (!confirmed) return;

    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((item) => item.id !== id));
      setEventsTotal((prev) => Math.max(prev - 1, 0));
      if (activeEvent?.id === id) {
        closeEventEditor();
      }
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Gagal menghapus kegiatan.");
    }
  }

  function openOfficerEditor(officer?: Officer) {
    if (officer) {
      setActiveOfficer(officer);
      setOfficerDraft({ ...officer });
    } else {
      setActiveOfficer(null);
      setOfficerDraft(emptyOfficerDraft);
    }
    setOfficerEditorVisible(true);
  }

  function closeOfficerEditor() {
    setOfficerEditorVisible(false);
    setActiveOfficer(null);
    setOfficerDraft(emptyOfficerDraft);
    setOfficerSaveError(null);
  }

  async function saveOfficer() {
    setOfficerSaving(true);
    setOfficerSaveError(null);

    try {
      if (activeOfficer?.id) {
        await updateOfficer(activeOfficer.id, officerDraft);
      } else {
        await createOfficer(officerDraft);
      }
      setOfficersPage(1);
      setSection("struktur");
      setOfficerEditorVisible(false);
      setActiveOfficer(null);
      setOfficerDraft(emptyOfficerDraft);
    } catch (error) {
      console.error("Failed to save officer", error);
      setOfficerSaveError("Gagal menyimpan pejabat. Periksa data dan coba lagi.");
    } finally {
      setOfficerSaving(false);
    }
  }

  async function handleDeleteOfficer(id: string) {
    const confirmed = window.confirm("Hapus pejabat ini?");
    if (!confirmed) return;

    try {
      await deleteOfficer(id);
      setOfficers((prev) => prev.filter((item) => item.id !== id));
      setOfficersTotal((prev) => Math.max(prev - 1, 0));
      if (activeOfficer?.id === id) {
        closeOfficerEditor();
      }
    } catch (error) {
      console.error("Failed to delete officer", error);
      alert("Gagal menghapus pejabat.");
    }
  }

  function openGalleryEditor(item?: GalleryItem) {
    if (item) {
      setActiveGalleryItem(item);
      setGalleryDraft({ ...item });
    } else {
      setActiveGalleryItem(null);
      setGalleryDraft(emptyGalleryDraft);
    }
    setGalleryEditorVisible(true);
  }

  function closeGalleryEditor() {
    setGalleryEditorVisible(false);
    setActiveGalleryItem(null);
    setGalleryDraft(emptyGalleryDraft);
    setGallerySaveError(null);
  }

  async function saveGalleryItem() {
    setGallerySaving(true);
    setGallerySaveError(null);

    try {
      if (activeGalleryItem?.id) {
        await updateGalleryItem(activeGalleryItem.id, galleryDraft);
      } else {
        await createGalleryItem(galleryDraft);
      }
      setGalleryPage(1);
      setSection("galeri");
      setGalleryEditorVisible(false);
      setActiveGalleryItem(null);
      setGalleryDraft(emptyGalleryDraft);
    } catch (error) {
      console.error("Failed to save gallery item", error);
      setGallerySaveError("Gagal menyimpan galeri. Periksa data dan coba lagi.");
    } finally {
      setGallerySaving(false);
    }
  }

  async function handleDeleteGallery(id: string) {
    const confirmed = window.confirm("Hapus item galeri ini?");
    if (!confirmed) return;

    try {
      await deleteGalleryItem(id);
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      setGalleryTotal((prev) => Math.max(prev - 1, 0));
      if (activeGalleryItem?.id === id) {
        closeGalleryEditor();
      }
    } catch (error) {
      console.error("Failed to delete gallery item", error);
      alert("Gagal menghapus item galeri.");
    }
  }

  function openPressKitEditor(item?: PressKitItem) {
    if (item) {
      setActivePressKitItem(item);
      setPressKitDraft({ ...item });
    } else {
      setActivePressKitItem(null);
      setPressKitDraft(emptyPressKitDraft);
    }
    setPressKitEditorVisible(true);
  }

  function closePressKitEditor() {
    setPressKitEditorVisible(false);
    setActivePressKitItem(null);
    setPressKitDraft(emptyPressKitDraft);
    setPressKitSaveError(null);
  }

  async function savePressKitItem() {
    setPressKitSaving(true);
    setPressKitSaveError(null);

    try {
      if (activePressKitItem?.id) {
        await updatePressKitItem(activePressKitItem.id, pressKitDraft);
      } else {
        await createPressKitItem(pressKitDraft);
      }
      setPressKitPage(1);
      setSection("presskit");
      setPressKitEditorVisible(false);
      setActivePressKitItem(null);
      setPressKitDraft(emptyPressKitDraft);
    } catch (error) {
      console.error("Failed to save press kit item", error);
      setPressKitSaveError("Gagal menyimpan press kit. Periksa data dan coba lagi.");
    } finally {
      setPressKitSaving(false);
    }
  }

  async function handleDeletePressKit(id: string) {
    const confirmed = window.confirm("Hapus item press kit ini?");
    if (!confirmed) return;

    try {
      await deletePressKitItem(id);
      setPressKitItems((prev) => prev.filter((item) => item.id !== id));
      setPressKitTotal((prev) => Math.max(prev - 1, 0));
      if (activePressKitItem?.id === id) {
        closePressKitEditor();
      }
    } catch (error) {
      console.error("Failed to delete press kit item", error);
      alert("Gagal menghapus item press kit.");
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await markContactRead(id);
      setContacts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "read" } : item)),
      );
    } catch (error) {
      console.error("Failed to mark contact read", error);
      alert("Gagal menandai pesan sebagai sudah dibaca.");
    }
  }

  if (authLoading) {
    return (
      <div className="admin-shell">
        <main className="login-panel">
          <h1>Command Connect Admin</h1>
          <p>Memuat autentikasi...</p>
        </main>
      </div>
    );
  }

  if (!session || !role) {
    return (
      <div className="admin-shell">
        <main className="login-panel">
          <h1>Command Connect Admin</h1>
          <p>Masuk untuk mengelola berita, kegiatan, dan konten situs.</p>
          <p className="tenant-info">Tenant: {tenantSlug}</p>
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
            {loginError ? <p className="auth-error">{loginError}</p> : authError ? <p className="auth-error">{authError}</p> : null}
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
        <div className="tenant-badge">{tenantSlug}</div>
        <nav>
          <button type="button" className={section === "dashboard" ? "active" : ""} onClick={() => setSection("dashboard")}>Dashboard</button>
          <button type="button" className={section === "berita" ? "active" : ""} onClick={() => setSection("berita")}>Berita</button>
          <button type="button" className={section === "kegiatan" ? "active" : ""} onClick={() => setSection("kegiatan")}>Kegiatan</button>
          <button type="button" className={section === "struktur" ? "active" : ""} onClick={() => setSection("struktur")}>Struktur</button>
          <button type="button" className={section === "galeri" ? "active" : ""} onClick={() => setSection("galeri")}>Galeri</button>
          <button type="button" className={section === "presskit" ? "active" : ""} onClick={() => setSection("presskit")}>Press Kit</button>
          <button type="button" className={section === "kontak" ? "active" : ""} onClick={() => setSection("kontak")}>Kontak</button>
          <button type="button" className={section === "settings" ? "active" : ""} onClick={() => setSection("settings")}>Pengaturan</button>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>
              {section === "dashboard"
                ? "Dashboard"
                : section === "berita"
                ? "Manajemen Berita"
                : section === "kegiatan"
                ? "Manajemen Kegiatan"
                : section === "struktur"
                ? "Manajemen Struktur"
                : section === "galeri"
                ? "Manajemen Galeri"
                : section === "presskit"
                ? "Manajemen Press Kit"
                : section === "kontak"
                ? "Inbox Kontak"
                : section === "settings"
                ? "Pengaturan"
                : (section as string).charAt(0).toUpperCase() + (section as string).slice(1)}
            </h1>
            <p>
              {section === "dashboard"
                ? "Ringkasan operasi admin dan akses cepat."
                : section === "berita"
                ? "Buat, edit, dan hapus artikel berita."
                : section === "kegiatan"
                ? "Buat, edit, dan hapus kegiatan publik."
                : section === "struktur"
                ? "Kelola pejabat aktif dan struktur komando."
                : section === "galeri"
                ? "Kelola item galeri dan urutan tampilannya."
                : section === "presskit"
                ? "Kelola dokumen press kit yang dapat diunduh."
                : section === "kontak"
                ? "Lihat pesan masuk dan tandai sudah dibaca."
                : "Kelola konten situs dan data publik."}
            </p>
          </div>
          <button className="button-secondary" onClick={handleLogout}>Logout</button>
        </header>

        {section === "dashboard" ? (
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
        ) : section === "berita" ? (
          <section className="section-preview" id="berita">
            <div className="section-preview-header section-actions">
              <div>
                <h2>Berita</h2>
                <p>Kelola artikel berita dengan status draft dan publikasi.</p>
              </div>
              <div className="button-group">
                <button className="button-primary" onClick={() => openNewsEditor()}>Buat Berita Baru</button>
                <button className="button-secondary" onClick={() => setNewsPage(1)}>Muat Ulang</button>
              </div>
            </div>
            {newsEditorVisible ? (
              <div className="news-editor">
                <div className="editor-header">
                  <h3>{activeNews ? "Edit Berita" : "Tambah Berita Baru"}</h3>
                  <button className="button-secondary" onClick={closeNewsEditor}>Batal</button>
                </div>
                <div className="news-form-grid">
                  <label className="field-group">
                    <span>Judul (ID)</span>
                    <input
                      type="text"
                      value={newsDraft.title.id}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, title: { ...prev.title, id: event.target.value } }))
                      }
                      placeholder="Judul bahasa Indonesia"
                    />
                  </label>
                  <label className="field-group">
                    <span>Judul (EN)</span>
                    <input
                      type="text"
                      value={newsDraft.title.en}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, title: { ...prev.title, en: event.target.value } }))
                      }
                      placeholder="English title"
                    />
                  </label>
                  <label className="field-group full-width">
                    <span>Slug (opsional)</span>
                    <input
                      type="text"
                      value={newsDraft.slug ?? ""}
                      onChange={(event) => setNewsDraft((prev) => ({ ...prev, slug: event.target.value }))}
                      placeholder="custom-slug-untuk-url"
                    />
                  </label>
                  <label className="field-group">
                    <span>Kategori (ID)</span>
                    <input
                      type="text"
                      value={newsDraft.category.id}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, category: { ...prev.category, id: event.target.value } }))
                      }
                      placeholder="Kategori bahasa Indonesia"
                    />
                  </label>
                  <label className="field-group">
                    <span>Kategori (EN)</span>
                    <input
                      type="text"
                      value={newsDraft.category.en}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, category: { ...prev.category, en: event.target.value } }))
                      }
                      placeholder="Category in English"
                    />
                  </label>
                  <label className="field-group">
                    <span>Tanggal Publikasi</span>
                    <input
                      type="date"
                      value={newsDraft.date}
                      onChange={(event) => setNewsDraft((prev) => ({ ...prev, date: event.target.value }))}
                    />
                  </label>
                  <label className="field-group">
                    <span>Cover Image URL</span>
                    <input
                      type="text"
                      value={newsDraft.cover}
                      onChange={(event) => setNewsDraft((prev) => ({ ...prev, cover: event.target.value }))}
                      placeholder="https://example.com/cover.jpg"
                    />
                  </label>
                  <label className="field-group full-width">
                    <span>Excerpt ID</span>
                    <textarea
                      value={newsDraft.excerpt.id}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, excerpt: { ...prev.excerpt, id: event.target.value } }))
                      }
                      placeholder="Ringkasan berita bahasa Indonesia"
                    />
                  </label>
                  <label className="field-group full-width">
                    <span>Excerpt EN</span>
                    <textarea
                      value={newsDraft.excerpt.en}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, excerpt: { ...prev.excerpt, en: event.target.value } }))
                      }
                      placeholder="Article summary in English"
                    />
                  </label>
                  <label className="field-group full-width">
                    <span>Body ID</span>
                    <textarea
                      value={newsDraft.body.id}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, body: { ...prev.body, id: event.target.value } }))
                      }
                      rows={5}
                      placeholder="Isi berita bahasa Indonesia"
                    />
                  </label>
                  <label className="field-group full-width">
                    <span>Body EN</span>
                    <textarea
                      value={newsDraft.body.en}
                      onChange={(event) =>
                        setNewsDraft((prev) => ({ ...prev, body: { ...prev.body, en: event.target.value } }))
                      }
                      rows={5}
                      placeholder="Article body in English"
                    />
                  </label>
                  <label className="field-group checkbox-field">
                    <span>Status Publikasi</span>
                    <input
                      type="checkbox"
                      checked={newsDraft.published}
                      onChange={(event) => setNewsDraft((prev) => ({ ...prev, published: event.target.checked }))}
                    />
                  </label>
                </div>
                {newsSaveError ? <p className="form-error">{newsSaveError}</p> : null}
                <div className="button-group editor-actions">
                  <button className="button-secondary" type="button" onClick={closeNewsEditor}>Batal</button>
                  <button className="button-primary" type="button" disabled={newsSaving} onClick={saveNewsArticle}>
                    {newsSaving ? "Menyimpan..." : "Simpan Berita"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="section-preview-body">
                {newsLoading ? (
                  "Memuat daftar berita..."
                ) : newsError ? (
                  newsError
                ) : news.length === 0 ? (
                  "Belum ada berita yang tersedia."
                ) : (
                  <div className="news-table-wrapper">
                    <table className="news-table">
                      <thead>
                        <tr>
                          <th>Judul</th>
                          <th>Tanggal</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {news.map((item) => (
                          <tr key={item.id}>
                            <td>{item.title.en || item.title.id}</td>
                            <td>{formatShortDate(item.date)}</td>
                            <td>
                              <span className={item.published ? "status-pill published" : "status-pill draft"}>
                                {item.published ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="news-actions">
                              <button className="button-secondary" type="button" onClick={() => openNewsEditor(item)}>
                                Edit
                              </button>
                              <button className="button-secondary" type="button" onClick={() => handleDeleteNews(item.id ?? "")}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination-controls">
                      <span>Halaman {newsPage} dari {Math.max(Math.ceil(newsTotal / 10), 1)}</span>
                      <div>
                        <button className="button-secondary" disabled={newsPage <= 1} onClick={() => setNewsPage((current) => Math.max(current - 1, 1))}>
                          Sebelumnya
                        </button>
                        <button className="button-primary" disabled={newsPage >= Math.ceil(newsTotal / 10)} onClick={() => setNewsPage((current) => current + 1)}>
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : section === "kegiatan" ? (
          <section className="section-preview" id="kegiatan">
            <div className="section-preview-header section-actions">
              <div>
                <h2>Kegiatan</h2>
                <p>Kelola agenda publik, tanggal, lokasi, dan status acara.</p>
              </div>
              <div className="button-group">
                <button className="button-primary" onClick={() => openEventEditor()}>Buat Kegiatan Baru</button>
                <button className="button-secondary" onClick={() => setEventPage(1)}>Muat Ulang</button>
              </div>
            </div>
            {eventEditorVisible ? (
              <div className="news-editor">
                <div className="editor-header">
                  <h3>{activeEvent ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}</h3>
                  <button className="button-secondary" onClick={closeEventEditor}>Batal</button>
                </div>
                <div className="news-form-grid">
                  <label className="field-group">
                    <span>Judul (ID)</span>
                    <input type="text" value={eventDraft.title.id} onChange={(event) => setEventDraft((prev) => ({ ...prev, title: { ...prev.title, id: event.target.value } }))} placeholder="Judul acara dalam bahasa Indonesia" />
                  </label>
                  <label className="field-group">
                    <span>Judul (EN)</span>
                    <input type="text" value={eventDraft.title.en} onChange={(event) => setEventDraft((prev) => ({ ...prev, title: { ...prev.title, en: event.target.value } }))} placeholder="Event title in English" />
                  </label>
                  <label className="field-group full-width">
                    <span>Tanggal</span>
                    <input type="date" value={eventDraft.date} onChange={(event) => setEventDraft((prev) => ({ ...prev, date: event.target.value }))} />
                  </label>
                  <label className="field-group full-width">
                    <span>Lokasi (ID)</span>
                    <input type="text" value={eventDraft.location.id} onChange={(event) => setEventDraft((prev) => ({ ...prev, location: { ...prev.location, id: event.target.value } }))} placeholder="Lokasi acara bahasa Indonesia" />
                  </label>
                  <label className="field-group full-width">
                    <span>Lokasi (EN)</span>
                    <input type="text" value={eventDraft.location.en} onChange={(event) => setEventDraft((prev) => ({ ...prev, location: { ...prev.location, en: event.target.value } }))} placeholder="Event location in English" />
                  </label>
                  <label className="field-group">
                    <span>Kategori (ID)</span>
                    <input type="text" value={eventDraft.category.id} onChange={(event) => setEventDraft((prev) => ({ ...prev, category: { ...prev.category, id: event.target.value } }))} placeholder="Kategori bahasa Indonesia" />
                  </label>
                  <label className="field-group">
                    <span>Kategori (EN)</span>
                    <input type="text" value={eventDraft.category.en} onChange={(event) => setEventDraft((prev) => ({ ...prev, category: { ...prev.category, en: event.target.value } }))} placeholder="Category in English" />
                  </label>
                  <label className="field-group">
                    <span>Cover Image URL</span>
                    <input type="text" value={eventDraft.cover} onChange={(event) => setEventDraft((prev) => ({ ...prev, cover: event.target.value }))} placeholder="https://example.com/cover.jpg" />
                  </label>
                  <label className="field-group checkbox-field">
                    <span>Sudah Selesai</span>
                    <input type="checkbox" checked={eventDraft.finished ?? false} onChange={(event) => setEventDraft((prev) => ({ ...prev, finished: event.target.checked }))} />
                  </label>
                  <label className="field-group full-width">
                    <span>Excerpt (ID)</span>
                    <textarea value={eventDraft.excerpt.id} onChange={(event) => setEventDraft((prev) => ({ ...prev, excerpt: { ...prev.excerpt, id: event.target.value } }))} placeholder="Ringkasan kegiatan bahasa Indonesia" />
                  </label>
                  <label className="field-group full-width">
                    <span>Excerpt (EN)</span>
                    <textarea value={eventDraft.excerpt.en} onChange={(event) => setEventDraft((prev) => ({ ...prev, excerpt: { ...prev.excerpt, en: event.target.value } }))} placeholder="Event summary in English" />
                  </label>
                </div>
                {eventSaveError ? <p className="form-error">{eventSaveError}</p> : null}
                <div className="button-group editor-actions">
                  <button className="button-secondary" type="button" onClick={closeEventEditor}>Batal</button>
                  <button className="button-primary" type="button" disabled={eventSaving} onClick={saveEvent}>{eventSaving ? "Menyimpan..." : "Simpan Kegiatan"}</button>
                </div>
              </div>
            ) : (
              <div className="section-preview-body">
                {eventsLoading ? (
                  "Memuat daftar kegiatan..."
                ) : eventsError ? (
                  eventsError
                ) : events.length === 0 ? (
                  "Belum ada kegiatan yang tersedia."
                ) : (
                  <div className="news-table-wrapper">
                    <table className="news-table">
                      <thead>
                        <tr>
                          <th>Judul</th>
                          <th>Tanggal</th>
                          <th>Lokasi</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((item) => (
                          <tr key={item.id}>
                            <td>{item.title.en || item.title.id}</td>
                            <td>{formatDate(item.date)}</td>
                            <td>{item.location.id || item.location.en}</td>
                            <td>
                              <span className={item.finished ? "status-pill read" : "status-pill published"}>
                                {item.finished ? "Selesai" : "Aktif"}
                              </span>
                            </td>
                            <td className="news-actions">
                              <button className="button-secondary" type="button" onClick={() => openEventEditor(item)}>Edit</button>
                              <button className="button-secondary" type="button" onClick={() => handleDeleteEvent(item.id ?? "")}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination-controls">
                      <span>Halaman {eventPage} dari {Math.max(Math.ceil(eventsTotal / 10), 1)}</span>
                      <div>
                        <button className="button-secondary" disabled={eventPage <= 1} onClick={() => setEventPage((current) => Math.max(current - 1, 1))}>Sebelumnya</button>
                        <button className="button-primary" disabled={eventPage >= Math.ceil(eventsTotal / 10)} onClick={() => setEventPage((current) => current + 1)}>Selanjutnya</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : section === "struktur" ? (
          <section className="section-preview" id="struktur">
            <div className="section-preview-header section-actions">
              <div>
                <h2>Struktur</h2>
                <p>Kelola pejabat, pangkat, masa jabatan, dan foto profil.</p>
              </div>
              <div className="button-group">
                <button className="button-primary" onClick={() => openOfficerEditor()}>Tambah Pejabat</button>
                <button className="button-secondary" onClick={() => setOfficersPage(1)}>Muat Ulang</button>
              </div>
            </div>
            {officerEditorVisible ? (
              <div className="news-editor">
                <div className="editor-header">
                  <h3>{activeOfficer ? "Edit Pejabat" : "Tambah Pejabat Baru"}</h3>
                  <button className="button-secondary" onClick={closeOfficerEditor}>Batal</button>
                </div>
                <div className="news-form-grid">
                  <label className="field-group">
                    <span>Kode Pangkat</span>
                    <input type="text" value={officerDraft.rank_code} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, rank_code: event.target.value }))} placeholder="Contoh: Kol" />
                  </label>
                  <label className="field-group">
                    <span>Nama Lengkap</span>
                    <input type="text" value={officerDraft.name} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nama pejabat" />
                  </label>
                  <label className="field-group full-width">
                    <span>Pangkat (ID)</span>
                    <input type="text" value={officerDraft.rank.name.id} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, rank: { ...prev.rank, name: { ...prev.rank.name, id: event.target.value } } }))} placeholder="Pangkat bahasa Indonesia" />
                  </label>
                  <label className="field-group full-width">
                    <span>Pangkat (EN)</span>
                    <input type="text" value={officerDraft.rank.name.en} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, rank: { ...prev.rank, name: { ...prev.rank.name, en: event.target.value } } }))} placeholder="Rank in English" />
                  </label>
                  <label className="field-group full-width">
                    <span>Jabatan (ID)</span>
                    <input type="text" value={officerDraft.position.name.id} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, position: { ...prev.position, name: { ...prev.position.name, id: event.target.value } } }))} placeholder="Jabatan bahasa Indonesia" />
                  </label>
                  <label className="field-group full-width">
                    <span>Jabatan (EN)</span>
                    <input type="text" value={officerDraft.position.name.en} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, position: { ...prev.position, name: { ...prev.position.name, en: event.target.value } } }))} placeholder="Position in English" />
                  </label>
                  <label className="field-group full-width">
                    <span>Divisi (ID)</span>
                    <input type="text" value={officerDraft.position.division.id} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, position: { ...prev.position, division: { ...prev.position.division, id: event.target.value } } }))} placeholder="Divisi bahasa Indonesia" />
                  </label>
                  <label className="field-group full-width">
                    <span>Divisi (EN)</span>
                    <input type="text" value={officerDraft.position.division.en} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, position: { ...prev.position, division: { ...prev.position.division, en: event.target.value } } }))} placeholder="Division in English" />
                  </label>
                  <label className="field-group full-width">
                    <span>Foto Profil URL</span>
                    <input type="text" value={officerDraft.photo} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, photo: event.target.value }))} placeholder="https://example.com/photo.jpg" />
                  </label>
                  <label className="field-group">
                    <span>Status</span>
                    <select value={officerDraft.status} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, status: event.target.value as "active" | "past" }))}>
                      <option value="active">Active</option>
                      <option value="past">Past</option>
                    </select>
                  </label>
                  <label className="field-group">
                    <span>Mulai</span>
                    <input type="date" value={officerDraft.term_start} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, term_start: event.target.value }))} />
                  </label>
                  <label className="field-group">
                    <span>Selesai</span>
                    <input type="date" value={officerDraft.term_end} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, term_end: event.target.value }))} />
                  </label>
                  <label className="field-group full-width">
                    <span>Bio (ID)</span>
                    <textarea value={officerDraft.bio.id} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, bio: { ...prev.bio, id: event.target.value } }))} placeholder="Bio singkat bahasa Indonesia" />
                  </label>
                  <label className="field-group full-width">
                    <span>Bio (EN)</span>
                    <textarea value={officerDraft.bio.en} onChange={(event) => setOfficerDraft((prev) => ({ ...prev, bio: { ...prev.bio, en: event.target.value } }))} placeholder="Short bio in English" />
                  </label>
                </div>
                {officerSaveError ? <p className="form-error">{officerSaveError}</p> : null}
                <div className="button-group editor-actions">
                  <button className="button-secondary" type="button" onClick={closeOfficerEditor}>Batal</button>
                  <button className="button-primary" type="button" disabled={officerSaving} onClick={saveOfficer}>{officerSaving ? "Menyimpan..." : "Simpan Pejabat"}</button>
                </div>
              </div>
            ) : (
              <div className="section-preview-body">
                {officersLoading ? (
                  "Memuat daftar pejabat..."
                ) : officersError ? (
                  officersError
                ) : officers.length === 0 ? (
                  "Belum ada pejabat yang tersedia."
                ) : (
                  <div className="news-table-wrapper">
                    <table className="news-table">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>Pangkat</th>
                          <th>Jabatan</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {officers.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.rank.name.id || item.rank.name.en}</td>
                            <td>{item.position.name.id || item.position.name.en}</td>
                            <td>
                              <span className={item.status === "active" ? "status-pill published" : "status-pill draft"}>
                                {item.status}
                              </span>
                            </td>
                            <td className="news-actions">
                              <button className="button-secondary" type="button" onClick={() => openOfficerEditor(item)}>Edit</button>
                              <button className="button-secondary" type="button" onClick={() => handleDeleteOfficer(item.id ?? "")}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination-controls">
                      <span>Halaman {officersPage} dari {Math.max(Math.ceil(officersTotal / 10), 1)}</span>
                      <div>
                        <button className="button-secondary" disabled={officersPage <= 1} onClick={() => setOfficersPage((current) => Math.max(current - 1, 1))}>Sebelumnya</button>
                        <button className="button-primary" disabled={officersPage >= Math.ceil(officersTotal / 10)} onClick={() => setOfficersPage((current) => current + 1)}>Selanjutnya</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : section === "galeri" ? (
          <section className="section-preview" id="galeri">
            <div className="section-preview-header section-actions">
              <div>
                <h2>Galeri</h2>
                <p>Atur item galeri untuk halaman publik.</p>
              </div>
              <div className="button-group">
                <button className="button-primary" onClick={() => openGalleryEditor()}>Tambah Item Galeri</button>
                <button className="button-secondary" onClick={() => setGalleryPage(1)}>Muat Ulang</button>
              </div>
            </div>
            {galleryEditorVisible ? (
              <div className="news-editor">
                <div className="editor-header">
                  <h3>{activeGalleryItem ? "Edit Item Galeri" : "Tambah Item Galeri"}</h3>
                  <button className="button-secondary" onClick={closeGalleryEditor}>Batal</button>
                </div>
                <div className="news-form-grid">
                  <label className="field-group full-width">
                    <span>Gambar URL</span>
                    <input type="text" value={galleryDraft.image} onChange={(event) => setGalleryDraft((prev) => ({ ...prev, image: event.target.value }))} placeholder="https://example.com/image.jpg" />
                  </label>
                  <label className="field-group full-width">
                    <span>Keterangan (ID)</span>
                    <input type="text" value={galleryDraft.caption.id} onChange={(event) => setGalleryDraft((prev) => ({ ...prev, caption: { ...prev.caption, id: event.target.value } }))} placeholder="Keterangan bahasa Indonesia" />
                  </label>
                  <label className="field-group full-width">
                    <span>Keterangan (EN)</span>
                    <input type="text" value={galleryDraft.caption.en} onChange={(event) => setGalleryDraft((prev) => ({ ...prev, caption: { ...prev.caption, en: event.target.value } }))} placeholder="Caption in English" />
                  </label>
                  <label className="field-group">
                    <span>Tanggal Foto</span>
                    <input type="date" value={galleryDraft.taken_at} onChange={(event) => setGalleryDraft((prev) => ({ ...prev, taken_at: event.target.value }))} />
                  </label>
                  <label className="field-group">
                    <span>Urutan</span>
                    <input type="number" value={galleryDraft.order ?? 0} onChange={(event) => setGalleryDraft((prev) => ({ ...prev, order: Number(event.target.value) }))} />
                  </label>
                </div>
                {gallerySaveError ? <p className="form-error">{gallerySaveError}</p> : null}
                <div className="button-group editor-actions">
                  <button className="button-secondary" type="button" onClick={closeGalleryEditor}>Batal</button>
                  <button className="button-primary" type="button" disabled={gallerySaving} onClick={saveGalleryItem}>{gallerySaving ? "Menyimpan..." : "Simpan Item Galeri"}</button>
                </div>
              </div>
            ) : (
              <div className="section-preview-body">
                {galleryLoading ? (
                  "Memuat galeri..."
                ) : galleryError ? (
                  galleryError
                ) : galleryItems.length === 0 ? (
                  "Belum ada item galeri yang tersedia."
                ) : (
                  <div className="news-table-wrapper">
                    <table className="news-table">
                      <thead>
                        <tr>
                          <th>Gambar</th>
                          <th>Keterangan</th>
                          <th>Tanggal</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {galleryItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.image}</td>
                            <td>{item.caption.id || item.caption.en}</td>
                            <td>{formatShortDate(item.taken_at)}</td>
                            <td className="news-actions">
                              <button className="button-secondary" type="button" onClick={() => openGalleryEditor(item)}>Edit</button>
                              <button className="button-secondary" type="button" onClick={() => handleDeleteGallery(item.id ?? "")}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination-controls">
                      <span>Halaman {galleryPage} dari {Math.max(Math.ceil(galleryTotal / 10), 1)}</span>
                      <div>
                        <button className="button-secondary" disabled={galleryPage <= 1} onClick={() => setGalleryPage((current) => Math.max(current - 1, 1))}>Sebelumnya</button>
                        <button className="button-primary" disabled={galleryPage >= Math.ceil(galleryTotal / 10)} onClick={() => setGalleryPage((current) => current + 1)}>Selanjutnya</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : section === "presskit" ? (
          <section className="section-preview" id="presskit">
            <div className="section-preview-header section-actions">
              <div>
                <h2>Press Kit</h2>
                <p>Kelola dokumen dan aset unduhan untuk media.
                </p>
              </div>
              <div className="button-group">
                <button className="button-primary" onClick={() => openPressKitEditor()}>Tambah Item Press Kit</button>
                <button className="button-secondary" onClick={() => setPressKitPage(1)}>Muat Ulang</button>
              </div>
            </div>
            {pressKitEditorVisible ? (
              <div className="news-editor">
                <div className="editor-header">
                  <h3>{activePressKitItem ? "Edit Item Press Kit" : "Tambah Item Press Kit"}</h3>
                  <button className="button-secondary" onClick={closePressKitEditor}>Batal</button>
                </div>
                <div className="news-form-grid">
                  <label className="field-group full-width">
                    <span>Nama Dokumen</span>
                    <input type="text" value={pressKitDraft.name} onChange={(event) => setPressKitDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nama file atau dokumen" />
                  </label>
                  <label className="field-group full-width">
                    <span>URL File</span>
                    <input type="text" value={pressKitDraft.file_asset} onChange={(event) => setPressKitDraft((prev) => ({ ...prev, file_asset: event.target.value }))} placeholder="https://example.com/file.pdf" />
                  </label>
                  <label className="field-group">
                    <span>Ukuran Label</span>
                    <input type="text" value={pressKitDraft.size_label} onChange={(event) => setPressKitDraft((prev) => ({ ...prev, size_label: event.target.value }))} placeholder="PDF, 2MB" />
                  </label>
                  <label className="field-group">
                    <span>Tipe</span>
                    <input type="text" value={pressKitDraft.type} onChange={(event) => setPressKitDraft((prev) => ({ ...prev, type: event.target.value }))} placeholder="PDF, DOCX" />
                  </label>
                  <label className="field-group">
                    <span>Urutan</span>
                    <input type="number" value={pressKitDraft.order ?? 0} onChange={(event) => setPressKitDraft((prev) => ({ ...prev, order: Number(event.target.value) }))} />
                  </label>
                </div>
                {pressKitSaveError ? <p className="form-error">{pressKitSaveError}</p> : null}
                <div className="button-group editor-actions">
                  <button className="button-secondary" type="button" onClick={closePressKitEditor}>Batal</button>
                  <button className="button-primary" type="button" disabled={pressKitSaving} onClick={savePressKitItem}>{pressKitSaving ? "Menyimpan..." : "Simpan Item Press Kit"}</button>
                </div>
              </div>
            ) : (
              <div className="section-preview-body">
                {pressKitLoading ? (
                  "Memuat press kit..."
                ) : pressKitError ? (
                  pressKitError
                ) : pressKitItems.length === 0 ? (
                  "Belum ada item press kit yang tersedia."
                ) : (
                  <div className="news-table-wrapper">
                    <table className="news-table">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>File</th>
                          <th>Ukuran</th>
                          <th>Tipe</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pressKitItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.file_asset}</td>
                            <td>{item.size_label}</td>
                            <td>{item.type}</td>
                            <td className="news-actions">
                              <button className="button-secondary" type="button" onClick={() => openPressKitEditor(item)}>Edit</button>
                              <button className="button-secondary" type="button" onClick={() => handleDeletePressKit(item.id ?? "")}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination-controls">
                      <span>Halaman {pressKitPage} dari {Math.max(Math.ceil(pressKitTotal / 10), 1)}</span>
                      <div>
                        <button className="button-secondary" disabled={pressKitPage <= 1} onClick={() => setPressKitPage((current) => Math.max(current - 1, 1))}>Sebelumnya</button>
                        <button className="button-primary" disabled={pressKitPage >= Math.ceil(pressKitTotal / 10)} onClick={() => setPressKitPage((current) => current + 1)}>Selanjutnya</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : section === "kontak" ? (
          <section className="section-preview" id="kontak">
            <div className="section-preview-header section-actions">
              <div>
                <h2>Pesan Kontak</h2>
                <p>Lihat pesan masuk dari formulir kontak publik.</p>
              </div>
              <button className="button-secondary" onClick={() => setContactsPage(1)}>Muat Ulang</button>
            </div>
            <div className="section-preview-body">
              {contactsLoading ? (
                "Memuat pesan..."
              ) : contactsError ? (
                contactsError
              ) : contacts.length === 0 ? (
                "Tidak ada pesan masuk."
              ) : (
                <div className="contact-table-wrapper">
                  <table className="contact-table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Organisasi</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((item) => (
                        <tr key={item.id ?? `${item.email}-${item.created_at}`}>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.org}</td>
                          <td>
                            <span className={item.status === "new" ? "status-pill new" : "status-pill read"}>
                              {item.status}
                            </span>
                          </td>
                          <td>{new Date(item.created_at || item.created || Date.now()).toLocaleDateString("id-ID")}</td>
                          <td>
                            <button className="button-secondary" type="button" onClick={() => handleMarkRead(item.id ?? "")} disabled={item.status !== "new"}>
                              Tandai Dibaca
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination-controls">
                    <span>Halaman {contactsPage} dari {Math.max(Math.ceil(contactsTotal / 15), 1)}</span>
                    <div>
                      <button className="button-secondary" disabled={contactsPage <= 1} onClick={() => setContactsPage((current) => Math.max(current - 1, 1))}>
                        Sebelumnya
                      </button>
                      <button className="button-primary" disabled={contactsPage >= Math.ceil(contactsTotal / 15)} onClick={() => setContactsPage((current) => current + 1)}>
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="section-preview">
            <div className="section-preview-body">
              <p className="placeholder-text">
                Modul <strong>{section}</strong> belum diimplementasikan sepenuhnya.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
