import { useEffect, useMemo, useState } from "react";
import type { ContactMessage, EventItem, GalleryItem, HoaxClaim, NewsArticle, Officer, PressKitItem, VideoItem } from "@shared/types";
import { getCurrentTenantSlug } from "@shared/tenant";
import {
  adminSignIn,
  adminSignOut,
  createEvent,
  createNews,
  createOfficer,
  createGalleryItem,
  createPressKitItem,
  createVideo,
  createHoaxClaim,
  deleteEvent,
  deleteGalleryItem,
  deleteNews,
  deleteOfficer,
  deletePressKitItem,
  deleteVideo,
  deleteHoaxClaim,
  getContactMessages,
  getEventsAdminList,
  getGalleryAdminList,
  getNewsAdminList,
  getOfficersAdminList,
  getPressKitAdminList,
  getVideosAdmin,
  getHoaxClaimsByNewsId,
  markContactRead,
  updateEvent,
  updateGalleryItem,
  updateNews,
  updateOfficer,
  updatePressKitItem,
  updateVideo,
  updateHoaxClaim,
} from "@shared/supabase";
import NewsSection from "./components/NewsSection";
import EventsSection from "./components/EventsSection";
import OfficersSection from "./components/OfficersSection";
import GallerySection from "./components/GallerySection";
import PressKitSection from "./components/PressKitSection";
import ContactsSection from "./components/ContactsSection";
import DashboardSection from "./components/DashboardSection";
import SettingsSection from "./components/SettingsSection";
import VideoSection from "./components/VideoSection";
import HoaxCheckerSection from "./components/HoaxCheckerSection";
import { useAdminAuth } from "./lib/auth";
import { canDelete, canCreate, canEdit } from "./lib/rbac";

type DashboardSummary = {
  totalNews: number;
  upcomingEvents: number;
  unreadMessages: number;
  activeOfficers: number;
};

type AdminSection = "dashboard" | "berita" | "kegiatan" | "struktur" | "galeri" | "presskit" | "video" | "hoax-checker" | "kontak" | "settings";

const initialSummary: DashboardSummary = {
  totalNews: 0,
  upcomingEvents: 0,
  unreadMessages: 0,
  activeOfficers: 0,
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

  const [eventPage, setEventPage] = useState(1);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [officersPage, setOfficersPage] = useState(1);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officersTotal, setOfficersTotal] = useState(0);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [officersError, setOfficersError] = useState<string | null>(null);

  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const [pressKitPage, setPressKitPage] = useState(1);
  const [pressKitItems, setPressKitItems] = useState<PressKitItem[]>([]);
  const [pressKitTotal, setPressKitTotal] = useState(0);
  const [pressKitLoading, setPressKitLoading] = useState(false);
  const [pressKitError, setPressKitError] = useState<string | null>(null);

  const [contactsPage, setContactsPage] = useState(1);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  const [videosPage, setVideosPage] = useState(1);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosTotal, setVideosTotal] = useState(0);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  const [hoaxClaimsLoading, setHoaxClaimsLoading] = useState(false);
  const [hoaxClaims, setHoaxClaims] = useState<HoaxClaim[]>([]);
  const [hoaxClaimsError, setHoaxClaimsError] = useState<string | null>(null);

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

    async function loadVideosList() {
      setVideosLoading(true);
      setVideosError(null);
      try {
        const response = await getVideosAdmin(videosPage, 10);
        setVideos(response.items as VideoItem[]);
        setVideosTotal(response.totalItems);
      } catch (error) {
        console.error("Failed to load videos list", error);
        setVideosError("Tidak dapat memuat daftar video.");
      } finally {
        setVideosLoading(false);
      }
    }

    async function loadHoaxClaimsList() {
      setHoaxClaimsLoading(true);
      setHoaxClaimsError(null);
      try {
        const allClaims: HoaxClaim[] = [];
        // Fetch hoax claims for all news articles (simplified approach)
        for (const article of news) {
          if (article.id) {
            const claims = await getHoaxClaimsByNewsId(article.id);
            allClaims.push(...claims);
          }
        }
        setHoaxClaims(allClaims);
      } catch (error) {
        console.error("Failed to load hoax claims", error);
        setHoaxClaimsError("Tidak dapat memuat klarifikasi hoax.");
      } finally {
        setHoaxClaimsLoading(false);
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
      case "video":
        void loadVideosList();
        break;
      case "hoax-checker":
        void loadHoaxClaimsList();
        break;
      case "kontak":
        void loadContactInbox();
        break;
      default:
        break;
    }
  }, [session, role, section, newsPage, eventPage, officersPage, galleryPage, pressKitPage, videosPage, contactsPage]);

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

  async function handleCreateNews(article: Omit<NewsArticle, "id" | "tenant_id">) {
    if (!canCreate(role)) {
      alert("Anda tidak memiliki izin untuk membuat berita.");
      return;
    }

    const createdNews = await createNews(article);
    setNews((prev) => [createdNews, ...prev]);
    setNewsTotal((prev) => prev + 1);
    setNewsPage(1);
  }

  async function handleUpdateNews(id: string, article: Omit<NewsArticle, "id" | "tenant_id">) {
    if (!canEdit(role)) {
      alert("Anda tidak memiliki izin untuk mengubah berita.");
      return;
    }

    const updatedNews = await updateNews(id, article);
    setNews((prev) => prev.map((item) => (item.id === id ? updatedNews : item)));
  }

  async function handleDeleteNews(id: string) {
    if (!canDelete(role)) {
      alert("Anda tidak memiliki izin untuk menghapus berita.");
      return;
    }

    const confirmed = window.confirm("Hapus berita ini?");
    if (!confirmed) return;

    try {
      await deleteNews(id);
      setNews((prev) => prev.filter((item) => item.id !== id));
      setNewsTotal((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to delete news", error);
      alert("Gagal menghapus berita.");
    }
  }

  async function handleCreateEvent(item: Omit<EventItem, "id" | "tenant_id">) {
    if (!canCreate(role)) {
      alert("Anda tidak memiliki izin untuk membuat kegiatan.");
      return;
    }

    const createdEvent = await createEvent(item);
    setEvents((prev) => [createdEvent, ...prev]);
    setEventsTotal((prev) => prev + 1);
    setEventPage(1);
  }

  async function handleUpdateEvent(id: string, item: Omit<EventItem, "id" | "tenant_id">) {
    if (!canEdit(role)) {
      alert("Anda tidak memiliki izin untuk mengubah kegiatan.");
      return;
    }

    const updatedEvent = await updateEvent(id, item);
    setEvents((prev) => prev.map((evt) => (evt.id === id ? updatedEvent : evt)));
  }

  async function handleDeleteEvent(id: string) {
    if (!canDelete(role)) {
      alert("Anda tidak memiliki izin untuk menghapus kegiatan.");
      return;
    }

    const confirmed = window.confirm("Hapus kegiatan ini?");
    if (!confirmed) return;

    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((item) => item.id !== id));
      setEventsTotal((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to delete event", error);
      alert("Gagal menghapus kegiatan.");
    }
  }

  async function handleCreateOfficer(item: Omit<Officer, "id" | "tenant_id">) {
    if (!canCreate(role)) {
      alert("Anda tidak memiliki izin untuk membuat pejabat.");
      return;
    }

    const createdOfficer = await createOfficer(item);
    setOfficers((prev) => [createdOfficer, ...prev]);
    setOfficersTotal((prev) => prev + 1);
    setOfficersPage(1);
  }

  async function handleUpdateOfficer(id: string, item: Omit<Officer, "id" | "tenant_id">) {
    if (!canEdit(role)) {
      alert("Anda tidak memiliki izin untuk mengubah pejabat.");
      return;
    }

    const updatedOfficer = await updateOfficer(id, item);
    setOfficers((prev) => prev.map((officer) => (officer.id === id ? updatedOfficer : officer)));
  }

  async function handleDeleteOfficer(id: string) {
    if (!canDelete(role)) {
      alert("Anda tidak memiliki izin untuk menghapus pejabat.");
      return;
    }

    const confirmed = window.confirm("Hapus pejabat ini?");
    if (!confirmed) return;

    try {
      await deleteOfficer(id);
      setOfficers((prev) => prev.filter((item) => item.id !== id));
      setOfficersTotal((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to delete officer", error);
      alert("Gagal menghapus pejabat.");
    }
  }

  async function handleCreateGalleryItem(item: Omit<GalleryItem, "id" | "tenant_id">) {
    if (!canCreate(role)) {
      alert("Anda tidak memiliki izin untuk membuat item galeri.");
      return;
    }

    const createdGalleryItem = await createGalleryItem(item);
    setGalleryItems((prev) => [createdGalleryItem, ...prev]);
    setGalleryTotal((prev) => prev + 1);
    setGalleryPage(1);
  }

  async function handleUpdateGalleryItem(id: string, item: Omit<GalleryItem, "id" | "tenant_id">) {
    if (!canEdit(role)) {
      alert("Anda tidak memiliki izin untuk mengubah item galeri.");
      return;
    }

    const updatedGalleryItem = await updateGalleryItem(id, item);
    setGalleryItems((prev) => prev.map((galleryItem) => (galleryItem.id === id ? updatedGalleryItem : galleryItem)));
  }

  async function handleDeleteGallery(id: string) {
    if (!canDelete(role)) {
      alert("Anda tidak memiliki izin untuk menghapus item galeri.");
      return;
    }

    const confirmed = window.confirm("Hapus item galeri ini?");
    if (!confirmed) return;

    try {
      await deleteGalleryItem(id);
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      setGalleryTotal((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to delete gallery item", error);
      alert("Gagal menghapus item galeri.");
    }
  }

  async function handleCreatePressKitItem(item: Omit<PressKitItem, "id" | "tenant_id">) {
    if (!canCreate(role)) {
      alert("Anda tidak memiliki izin untuk membuat item press kit.");
      return;
    }

    const createdItem = await createPressKitItem(item);
    setPressKitItems((prev) => [createdItem, ...prev]);
    setPressKitTotal((prev) => prev + 1);
    setPressKitPage(1);
  }

  async function handleUpdatePressKitItem(id: string, item: Omit<PressKitItem, "id" | "tenant_id">) {
    if (!canEdit(role)) {
      alert("Anda tidak memiliki izin untuk mengubah item press kit.");
      return;
    }

    const updatedItem = await updatePressKitItem(id, item);
    setPressKitItems((prev) => prev.map((pressKitItem) => (pressKitItem.id === id ? updatedItem : pressKitItem)));
  }

  async function handleDeletePressKit(id: string) {
    if (!canDelete(role)) {
      alert("Anda tidak memiliki izin untuk menghapus item press kit.");
      return;
    }

    const confirmed = window.confirm("Hapus item press kit ini?");
    if (!confirmed) return;

    try {
      await deletePressKitItem(id);
      setPressKitItems((prev) => prev.filter((item) => item.id !== id));
      setPressKitTotal((prev) => Math.max(prev - 1, 0));
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

  async function handleCreateVideo(video: Omit<VideoItem, "id" | "tenant_id">) {
    if (!canCreate(role)) {
      alert("Anda tidak memiliki izin untuk membuat video.");
      return;
    }

    const createdVideo = await createVideo(video);
    setVideos((prev) => [createdVideo, ...prev]);
    setVideosTotal((prev) => prev + 1);
    setVideosPage(1);
  }

  async function handleUpdateVideo(id: string, video: Omit<VideoItem, "id" | "tenant_id">) {
    if (!canEdit(role)) {
      alert("Anda tidak memiliki izin untuk mengubah video.");
      return;
    }

    const updatedVideo = await updateVideo(id, video);
    setVideos((prev) => prev.map((item) => (item.id === id ? updatedVideo : item)));
  }

  async function handleDeleteVideo(id: string) {
    if (!canDelete(role)) {
      alert("Anda tidak memiliki izin untuk menghapus video.");
      return;
    }

    const confirmed = window.confirm("Hapus video ini?");
    if (!confirmed) return;

    try {
      await deleteVideo(id);
      setVideos((prev) => prev.filter((item) => item.id !== id));
      setVideosTotal((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to delete video", error);
      alert("Gagal menghapus video.");
    }
  }

  async function handleCreateHoaxClaim(claim: Omit<HoaxClaim, "id" | "tenant_id">) {
    if (!canCreate(role)) {
      alert("Anda tidak memiliki izin untuk membuat klarifikasi.");
      return;
    }

    const createdClaim = await createHoaxClaim(claim);
    setHoaxClaims((prev) => [createdClaim, ...prev]);
  }

  async function handleUpdateHoaxClaim(id: string, claim: Omit<HoaxClaim, "id" | "tenant_id">) {
    if (!canEdit(role)) {
      alert("Anda tidak memiliki izin untuk mengubah klarifikasi.");
      return;
    }

    const updatedClaim = await updateHoaxClaim(id, claim);
    setHoaxClaims((prev) => prev.map((item) => (item.id === id ? updatedClaim : item)));
  }

  async function handleDeleteHoaxClaim(id: string) {
    if (!canDelete(role)) {
      alert("Anda tidak memiliki izin untuk menghapus klarifikasi.");
      return;
    }

    const confirmed = window.confirm("Hapus klarifikasi ini?");
    if (!confirmed) return;

    try {
      await deleteHoaxClaim(id);
      setHoaxClaims((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete hoax claim", error);
      alert("Gagal menghapus klarifikasi.");
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
          <button type="button" className={section === "video" ? "active" : ""} onClick={() => setSection("video")}>Video</button>
          <button type="button" className={section === "hoax-checker" ? "active" : ""} onClick={() => setSection("hoax-checker")}>Klarifikasi</button>
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
                : section === "video"
                ? "Manajemen Video"
                : section === "hoax-checker"
                ? "Manajemen Klarifikasi"
                : section === "kontak"
                ? "Pesan Kontak"
                : "Pengaturan"}
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
                : section === "video"
                ? "Buat, edit, dan hapus video YouTube."
                : section === "hoax-checker"
                ? "Kelola klarifikasi hoax dan misinformasi untuk artikel berita."
                : section === "kontak"
                ? "Lihat pesan masuk dan tandai sudah dibaca."
                : "Kelola konten situs dan data publik."}
            </p>
          </div>
          <button className="button-secondary" onClick={handleLogout}>Logout</button>
        </header>

        <div className="admin-content">
          {section === "dashboard" && <DashboardSection summary={summary} loading={loadingSummary} />}
          {section === "berita" && (
            <NewsSection
              news={news}
              loading={newsLoading}
              total={newsTotal}
              page={newsPage}
              onCreate={async (article) => await handleCreateNews(article)}
              onUpdate={async (id, article) => await handleUpdateNews(id, article)}
              onDelete={async (id) => await handleDeleteNews(id)}
            />
          )}
          {section === "kegiatan" && (
            <EventsSection
              events={events}
              loading={eventsLoading}
              total={eventsTotal}
              page={eventPage}
              onCreate={async (item) => await handleCreateEvent(item)}
              onUpdate={async (id, item) => await handleUpdateEvent(id, item)}
              onDelete={async (id) => await handleDeleteEvent(id)}
            />
          )}
          {section === "struktur" && (
            <OfficersSection
              officers={officers}
              loading={officersLoading}
              total={officersTotal}
              page={officersPage}
              onCreate={async (item) => await handleCreateOfficer(item)}
              onUpdate={async (id, item) => await handleUpdateOfficer(id, item)}
              onDelete={async (id) => await handleDeleteOfficer(id)}
            />
          )}
          {section === "galeri" && (
            <GallerySection
              gallery={galleryItems}
              loading={galleryLoading}
              total={galleryTotal}
              page={galleryPage}
              onCreate={async (item) => await handleCreateGalleryItem(item)}
              onUpdate={async (id, item) => await handleUpdateGalleryItem(id, item)}
              onDelete={async (id) => await handleDeleteGallery(id)}
            />
          )}
          {section === "presskit" && (
            <PressKitSection
              items={pressKitItems}
              loading={pressKitLoading}
              total={pressKitTotal}
              page={pressKitPage}
              onCreate={async (item) => await handleCreatePressKitItem(item)}
              onUpdate={async (id, item) => await handleUpdatePressKitItem(id, item)}
              onDelete={async (id) => await handleDeletePressKit(id)}
            />
          )}
          {section === "video" && (
            <VideoSection
              videos={videos}
              loading={videosLoading}
              total={videosTotal}
              page={videosPage}
              onCreate={async (video) => await handleCreateVideo(video)}
              onUpdate={async (id, video) => await handleUpdateVideo(id, video)}
              onDelete={async (id) => await handleDeleteVideo(id)}
            />
          )}
          {section === "hoax-checker" && (
            <HoaxCheckerSection
              hoaxClaims={hoaxClaims}
              news={news}
              loading={hoaxClaimsLoading}
              onCreate={async (claim) => await handleCreateHoaxClaim(claim)}
              onUpdate={async (id, claim) => await handleUpdateHoaxClaim(id, claim)}
              onDelete={async (id) => await handleDeleteHoaxClaim(id)}
            />
          )}
          {section === "kontak" && (
            <ContactsSection
              contacts={contacts}
              loading={contactsLoading}
              total={contactsTotal}
              page={contactsPage}
              onMarkRead={(id) => handleMarkRead(id)}
            />
          )}
          {section === "settings" && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}
