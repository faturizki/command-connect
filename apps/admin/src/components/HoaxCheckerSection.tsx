import React, { useState } from "react";
import type { HoaxClaim, NewsArticle } from "@shared/types";

interface Props {
  hoaxClaims: HoaxClaim[];
  news: NewsArticle[];
  loading: boolean;
  onCreate: (claim: Omit<HoaxClaim, "id" | "tenant_id">) => Promise<void>;
  onUpdate: (id: string, claim: Omit<HoaxClaim, "id" | "tenant_id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function HoaxCheckerSection({ hoaxClaims, news, loading, onCreate, onUpdate, onDelete }: Props) {
  const emptyDraft: Omit<HoaxClaim, "id" | "tenant_id"> = {
    news_article_id: "",
    hoax_claim_title: "",
    hoax_claim_image_url: "",
    hoax_claim_source: "",
    fact_check_title: "",
    fact_check_body: "",
    status: "hoax",
  };

  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<Omit<HoaxClaim, "id" | "tenant_id">>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor(item?: HoaxClaim) {
    if (item) {
      setEditingId(item.id ?? null);
      setDraft({
        news_article_id: item.news_article_id,
        hoax_claim_title: item.hoax_claim_title,
        hoax_claim_image_url: item.hoax_claim_image_url || "",
        hoax_claim_source: item.hoax_claim_source || "",
        fact_check_title: item.fact_check_title,
        fact_check_body: item.fact_check_body,
        status: item.status,
      });
    } else {
      setEditingId(null);
      setDraft(emptyDraft);
    }
    setError(null);
    setEditorVisible(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (!draft.news_article_id) {
        throw new Error("Pilih artikel berita terlebih dahulu");
      }
      if (!draft.hoax_claim_title) {
        throw new Error("Judul klaim hoax tidak boleh kosong");
      }
      if (!draft.fact_check_title || !draft.fact_check_body) {
        throw new Error("Judul dan isi klarifikasi tidak boleh kosong");
      }

      if (editingId) {
        await onUpdate(editingId, draft);
      } else {
        await onCreate(draft);
      }
      setEditorVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Hapus klarifikasi hoax ini?")) {
      try {
        await onDelete(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menghapus klarifikasi");
      }
    }
  }

  const statusLabels: Record<string, string> = {
    hoax: "HOAX",
    misinformation: "DISINFORMASI",
    partially_true: "SEBAGIAN BENAR",
    true: "FAKTA",
  };

  const statusColors: Record<string, string> = {
    hoax: "#dc2626",
    misinformation: "#ea580c",
    partially_true: "#f59e0b",
    true: "#10b981",
  };

  return (
    <section>
      <div className="section-header">
        <h2>Manajemen Hoax Checker</h2>
        <div className="button-group">
          <button onClick={() => openEditor()} className="button-primary">
            Buat Klarifikasi
          </button>
        </div>
      </div>

      {editorVisible ? (
        <div className="editor-panel">
          <h3>{editingId ? "Edit Klarifikasi" : "Klarifikasi Baru"}</h3>
          {error && <p className="form-error">{error}</p>}

          <label>
            Pilih Artikel Berita
            <select
              value={draft.news_article_id}
              onChange={(e) => setDraft({ ...draft, news_article_id: e.target.value })}
              required
            >
              <option value="">-- Pilih Berita --</option>
              {news.map((item) => (
                <option key={item.id} value={item.id!}>
                  {item.title?.en || item.title?.id || "Untitled"}
                </option>
              ))}
            </select>
          </label>

          <fieldset style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ccc" }}>
            <legend>Informasi Klaim Hoax</legend>

            <label>
              Judul Klaim Hoax
              <input
                type="text"
                value={draft.hoax_claim_title}
                onChange={(e) => setDraft({ ...draft, hoax_claim_title: e.target.value })}
                placeholder="Contoh: 'Pejabat XYZ tertangkap korupsi'"
                required
              />
            </label>

            <label>
              URL Gambar Klaim (Screenshot)
              <input
                type="text"
                value={draft.hoax_claim_image_url || ""}
                onChange={(e) => setDraft({ ...draft, hoax_claim_image_url: e.target.value })}
                placeholder="https://example.com/screenshot.jpg"
              />
            </label>

            <label>
              Sumber Klaim (opsional)
              <input
                type="text"
                value={draft.hoax_claim_source || ""}
                onChange={(e) => setDraft({ ...draft, hoax_claim_source: e.target.value })}
                placeholder="Contoh: Dari media sosial, forum, dll"
              />
            </label>
          </fieldset>

          <fieldset style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ccc" }}>
            <legend>Informasi Klarifikasi Fakta</legend>

            <label>
              Judul Klarifikasi
              <input
                type="text"
                value={draft.fact_check_title}
                onChange={(e) => setDraft({ ...draft, fact_check_title: e.target.value })}
                placeholder="Contoh: 'Klarifikasi Resmi: Pejabat XYZ Tidak Terbukti Korupsi'"
                required
              />
            </label>

            <label>
              Isi Klarifikasi (Fakta)
              <textarea
                value={draft.fact_check_body}
                onChange={(e) => setDraft({ ...draft, fact_check_body: e.target.value })}
                placeholder="Penjelasan detail tentang fakta sebenarnya..."
                rows={6}
                required
              />
            </label>

            <label>
              Status Klarifikasi
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as any })}
              >
                <option value="hoax">🚫 HOAX</option>
                <option value="misinformation">⚠️ DISINFORMASI</option>
                <option value="partially_true">⚠️ SEBAGIAN BENAR</option>
                <option value="true">✓ FAKTA</option>
              </select>
            </label>
          </fieldset>

          <div className="button-group" style={{ marginTop: "1.5rem" }}>
            <button onClick={save} disabled={saving} className="button-primary">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button onClick={() => setEditorVisible(false)} disabled={saving} className="button-secondary">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <p>Memuat klarifikasi...</p>
          ) : hoaxClaims.length === 0 ? (
            <p>Belum ada klarifikasi hoax.</p>
          ) : (
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th>Berita</th>
                    <th>Klaim Hoax</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {hoaxClaims.map((item) => {
                    const newsItem = news.find((n) => n.id === item.news_article_id);
                    return (
                      <tr key={item.id}>
                        <td style={{ fontSize: "0.9rem" }}>
                          {newsItem?.title?.en || newsItem?.title?.id || "Unknown"}
                        </td>
                        <td style={{ fontSize: "0.9rem" }}>{item.hoax_claim_title}</td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "0.25rem",
                              backgroundColor: statusColors[item.status],
                              color: "white",
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                            }}
                          >
                            {statusLabels[item.status]}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => openEditor(item)} className="button-small">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(item.id!)} className="button-small button-danger">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
