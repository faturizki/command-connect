// Dummy data for the public-facing site. Swap with PocketBase later.

export type Officer = {
  id: string;
  rankCode: string; // e.g. LETJEN, BRIGJEN
  rank: { id: string; en: string };
  name: string;
  position: { id: string; en: string };
  photo: string;
  status: "active" | "past";
  termStart: string; // YYYY-MM
  termEnd?: string; // undefined if active
  bio?: { id: string; en: string };
};

export const officers: Officer[] = [
  {
    id: "1",
    rankCode: "LETJEN",
    rank: { id: "Letnan Jenderal", en: "Lieutenant General" },
    name: "Bagus Pratama",
    position: { id: "Komandan Korps", en: "Corps Commander" },
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&q=80",
    status: "active",
    termStart: "2024-03",
  },
  {
    id: "2",
    rankCode: "BRIGJEN",
    rank: { id: "Brigadir Jenderal", en: "Brigadier General" },
    name: "Sari Wulandari",
    position: { id: "Wakil Komandan", en: "Deputy Commander" },
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80",
    status: "active",
    termStart: "2024-05",
  },
  {
    id: "3",
    rankCode: "KOLONEL",
    rank: { id: "Kolonel", en: "Colonel" },
    name: "Arief Hidayat",
    position: { id: "Kepala Penerangan", en: "Head of Public Affairs" },
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
    status: "active",
    termStart: "2023-11",
  },
  {
    id: "4",
    rankCode: "LETKOL",
    rank: { id: "Letnan Kolonel", en: "Lieutenant Colonel" },
    name: "Dian Permata",
    position: { id: "Kepala Hubungan Media", en: "Head of Media Relations" },
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&q=80",
    status: "active",
    termStart: "2024-01",
  },
  {
    id: "5",
    rankCode: "LETJEN",
    rank: { id: "Letnan Jenderal", en: "Lieutenant General" },
    name: "Wahyu Santoso",
    position: { id: "Komandan Korps", en: "Corps Commander" },
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
    status: "past",
    termStart: "2021-02",
    termEnd: "2024-03",
  },
  {
    id: "6",
    rankCode: "BRIGJEN",
    rank: { id: "Brigadir Jenderal", en: "Brigadier General" },
    name: "Rahmat Ibrahim",
    position: { id: "Wakil Komandan", en: "Deputy Commander" },
    photo: "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=900&q=80",
    status: "past",
    termStart: "2020-08",
    termEnd: "2024-05",
  },
  {
    id: "7",
    rankCode: "KOLONEL",
    rank: { id: "Kolonel", en: "Colonel" },
    name: "Sutrisno Adi",
    position: { id: "Kepala Penerangan", en: "Head of Public Affairs" },
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&q=80",
    status: "past",
    termStart: "2019-04",
    termEnd: "2023-11",
  },
];

export type EventItem = {
  id: string;
  date: string; // ISO
  category: { id: string; en: string };
  title: { id: string; en: string };
  location: { id: string; en: string };
  cover: string;
  excerpt: { id: string; en: string };
};

export const events: EventItem[] = [
  {
    id: "e1",
    date: "2026-08-14",
    category: { id: "Pelatihan", en: "Training" },
    title: {
      id: "Workshop Pers & Komunikasi Krisis",
      en: "Press & Crisis Communications Workshop",
    },
    location: { id: "Gedung Diklat Korps, Bandung", en: "Corps Training Center, Bandung" },
    cover: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1400&q=80",
    excerpt: {
      id: "Pelatihan tiga hari untuk perwira penerangan dan jurnalis mitra.",
      en: "A three-day workshop for public affairs officers and partner journalists.",
    },
  },
  {
    id: "e2",
    date: "2026-07-15",
    category: { id: "Lomba", en: "Competition" },
    title: {
      id: "Lomba Karya Jurnalistik Pertahanan",
      en: "Defense Journalism Award",
    },
    location: { id: "Auditorium Mabes, Jakarta", en: "HQ Auditorium, Jakarta" },
    cover: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1400&q=80",
    excerpt: {
      id: "Kompetisi karya tulis dan foto bertema profesionalisme militer.",
      en: "Writing and photography competition on military professionalism.",
    },
  },
  {
    id: "e3",
    date: "2026-09-02",
    category: { id: "Publik", en: "Public" },
    title: { id: "Open House Markas Korps", en: "Corps HQ Open House" },
    location: { id: "Markas Korps, Jakarta", en: "Corps HQ, Jakarta" },
    cover: "https://images.unsplash.com/photo-1532093912306-1ee5d7f55f95?w=1400&q=80",
    excerpt: {
      id: "Kunjungan publik dan demonstrasi kesiapan satuan.",
      en: "Public visit and unit readiness demonstration.",
    },
  },
  {
    id: "e4",
    date: "2026-10-21",
    category: { id: "Bakti Sosial", en: "Community" },
    title: { id: "Bakti Sosial Daerah Pesisir", en: "Coastal Community Service" },
    location: { id: "Pesisir Cilacap", en: "Cilacap Coast" },
    cover: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1400&q=80",
    excerpt: {
      id: "Distribusi bantuan logistik dan layanan kesehatan gratis.",
      en: "Logistical aid distribution and free medical services.",
    },
  },
];

export type NewsItem = {
  id: string;
  slug: string;
  date: string;
  category: { id: string; en: string };
  title: { id: string; en: string };
  cover: string;
  excerpt: { id: string; en: string };
};

export const news: NewsItem[] = [
  {
    id: "n1",
    slug: "bakti-sosial-di-wilayah-terdampak-bencana",
    date: "2026-06-01",
    category: { id: "Berita", en: "News" },
    title: {
      id: "Bakti Sosial di Wilayah Terdampak Bencana",
      en: "Community Service in Disaster-Affected Areas",
    },
    cover: "https://images.unsplash.com/photo-1547617045-1689c2f8f4c0?w=1600&q=80",
    excerpt: {
      id: "Tim Korps menyalurkan bantuan logistik dan layanan kesehatan untuk warga terdampak banjir.",
      en: "The Corps team delivered logistical aid and medical services to flood-affected residents.",
    },
  },
  {
    id: "n2",
    slug: "modernisasi-komunikasi-publik-berbasis-digital",
    date: "2026-06-01",
    category: { id: "Rilis Pers", en: "Press Release" },
    title: {
      id: "Modernisasi Komunikasi Publik Berbasis Digital",
      en: "Digital-Based Public Communications Modernization",
    },
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80",
    excerpt: {
      id: "Korps meluncurkan platform terpadu untuk distribusi rilis pers dan dokumentasi resmi.",
      en: "The Corps launches a unified platform for press release distribution and official documentation.",
    },
  },
  {
    id: "n3",
    slug: "latihan-gabungan-komunikasi-antar-satuan",
    date: "2026-05-24",
    category: { id: "Berita", en: "News" },
    title: {
      id: "Latihan Gabungan Komunikasi Antar-Satuan",
      en: "Joint Inter-Unit Communications Drill",
    },
    cover: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1600&q=80",
    excerpt: {
      id: "Sinkronisasi protokol komunikasi krisis antar satuan operasional.",
      en: "Crisis communications protocol synchronization across operational units.",
    },
  },
  {
    id: "n4",
    slug: "pernyataan-resmi-operasi-kemanusiaan-selesai",
    date: "2026-05-12",
    category: { id: "Rilis Pers", en: "Press Release" },
    title: {
      id: "Pernyataan Resmi: Operasi Kemanusiaan Selesai",
      en: "Official Statement: Humanitarian Operation Concluded",
    },
    cover: "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=1600&q=80",
    excerpt: {
      id: "Rangkaian operasi kemanusiaan di wilayah timur ditutup dengan evaluasi menyeluruh.",
      en: "The series of humanitarian operations in the eastern region concluded with full evaluation.",
    },
  },
];

export const gallery = [
  "https://images.unsplash.com/photo-1547617045-1689c2f8f4c0?w=1200&q=80",
  "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80",
  "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=1200&q=80",
  "https://images.unsplash.com/photo-1532093912306-1ee5d7f55f95?w=1200&q=80",
  "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80",
];

export const pressKit = [
  { name: "Logo Resmi (SVG + PNG)", size: "2.1 MB", type: "ZIP" },
  { name: "Panduan Identitas Visual", size: "4.6 MB", type: "PDF" },
  { name: "Foto Pimpinan Resolusi Tinggi", size: "12.3 MB", type: "ZIP" },
  { name: "Lembar Fakta Satuan", size: "640 KB", type: "PDF" },
  { name: "B-Roll Footage (1080p)", size: "184 MB", type: "MP4" },
];
