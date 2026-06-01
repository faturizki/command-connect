import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "id" | "en";

type Dict = Record<string, { id: string; en: string }>;

export const dict = {
  // Nav
  nav_home: { id: "Beranda", en: "Home" },
  nav_structure: { id: "Struktur Komando", en: "Command Structure" },
  nav_history: { id: "Riwayat Jabatan", en: "Position History" },
  nav_events: { id: "Kegiatan", en: "Events" },
  nav_news: { id: "Berita & Pers", en: "News & Press" },
  nav_gallery: { id: "Galeri", en: "Gallery" },
  nav_videos: { id: "Video", en: "Videos" },
  nav_search: { id: "Cari", en: "Search" },
  nav_press_kit: { id: "Press Kit", en: "Press Kit" },
  nav_profile: { id: "Profil Satuan", en: "Unit Profile" },
  nav_contact: { id: "Kontak", en: "Contact" },

  brand_name: { id: "Korps Publik & Pers", en: "Korps Publik & Pers" },
  brand_sub: { id: "Pusat Penerangan", en: "Public Affairs Center" },

  // Hero
  hero_eyebrow: { id: "Pusat Penerangan Resmi", en: "Official Public Affairs" },
  hero_title_1: { id: "Suara Resmi.", en: "Official Voice." },
  hero_title_2: { id: "Informasi Terverifikasi.", en: "Verified Information." },
  hero_title_3: { id: "Untuk Publik.", en: "For the Public." },
  hero_sub: {
    id: "Saluran komunikasi resmi Korps Publik & Pers — transparan, profesional, dan dapat diakses 24 jam.",
    en: "Official communications channel of Korps Publik & Pers — transparent, professional, accessible 24/7.",
  },
  cta_latest: { id: "Lihat Berita Terbaru", en: "Latest News" },
  cta_structure: { id: "Struktur Komando", en: "Command Structure" },

  // Sections
  sec_news: { id: "Berita & Rilis Pers", en: "News & Press Releases" },
  sec_events: { id: "Kegiatan Mendatang", en: "Upcoming Events" },
  sec_leaders: { id: "Jajaran Pimpinan", en: "Leadership" },
  sec_history: { id: "Riwayat Jabatan", en: "Position History" },
  sec_gallery: { id: "Galeri Dokumentasi", en: "Documentation Gallery" },
  sec_video: { id: "Video Dokumentasi", en: "Video Documentation" },
  sec_press_kit: { id: "Press Kit Resmi", en: "Official Press Kit" },
  sec_profile: { id: "Profil Satuan", en: "Unit Profile" },
  sec_contact: { id: "Kontak Pers", en: "Press Contact" },

  view_all: { id: "Lihat Semua", en: "View All" },
  read_more: { id: "Selengkapnya", en: "Read More" },
  download: { id: "Unduh", en: "Download" },
  active: { id: "Aktif", en: "Active" },
  past: { id: "Purna / Pindah Satuan", en: "Past / Transferred" },
  search_placeholder: { id: "Cari berita atau kegiatan...", en: "Search news or events..." },
  search_button: { id: "Cari", en: "Search" },
  search_label: { id: "Pencarian", en: "Search" },
  sec_search: { id: "Pencarian", en: "Search" },

  // Profile
  profile_lead: {
    id: "Korps Publik & Pers adalah satuan komunikasi strategis yang bertugas mengelola informasi resmi, hubungan media, dan transparansi publik.",
    en: "Korps Publik & Pers is a strategic communications unit responsible for official information management, media relations, and public transparency.",
  },
  vision: { id: "Visi", en: "Vision" },
  mission: { id: "Misi", en: "Mission" },

  // Contact
  contact_lead: {
    id: "Untuk permintaan wawancara, konfirmasi rilis, dan akses peliputan.",
    en: "For interview requests, release confirmations, and media access.",
  },
  form_name: { id: "Nama", en: "Name" },
  form_org: { id: "Media / Organisasi", en: "Media / Organization" },
  form_email: { id: "Email", en: "Email" },
  form_msg: { id: "Pesan", en: "Message" },
  form_send: { id: "Kirim Permintaan", en: "Send Request" },

  footer_rights: { id: "Hak cipta dilindungi.", en: "All rights reserved." },
  footer_disclaimer: {
    id: "Situs resmi — seluruh konten telah diverifikasi oleh Tim Penerangan.",
    en: "Official site — all content verified by the Public Affairs team.",
  },
} satisfies Dict;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("kpp_lang") : null;
    if (stored === "id" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("kpp_lang", l);
  };

  const t = (key: keyof typeof dict) => dict[key][lang];

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
