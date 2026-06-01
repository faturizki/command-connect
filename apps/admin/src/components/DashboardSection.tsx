import React from "react";

interface Props {
  summary: { totalNews: number; upcomingEvents: number; unreadMessages: number; activeOfficers: number };
  loading: boolean;
}

export default function DashboardSection({ summary, loading }: Props) {
  if (loading) return <p>Memuat ringkasan...</p>;
  return (
    <section>
      <h2>Dashboard</h2>
      <div className="summary-grid">
        <div className="card">Berita: {summary.totalNews}</div>
        <div className="card">Kegiatan mendatang: {summary.upcomingEvents}</div>
        <div className="card">Pesan belum dibaca: {summary.unreadMessages}</div>
        <div className="card">Pejabat aktif: {summary.activeOfficers}</div>
      </div>
    </section>
  );
}
