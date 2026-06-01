import React from "react";
import type { NewsArticle } from "@shared/types";

import React, { useState } from "react";
import type { NewsArticle } from "@shared/types";

interface Props {
  news: NewsArticle[];
  loading: boolean;
  total: number;
  page: number;
  onCreate: (article: Omit<NewsArticle, "id" | "tenant_id">) => Promise<void>;
  onUpdate: (id: string, article: Omit<NewsArticle, "id" | "tenant_id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function NewsSection({ news, loading, total, page, onCreate, onUpdate, onDelete }: Props) {
  const emptyDraft: Omit<NewsArticle, "id" | "tenant_id"> = {
    title: { id: "", en: "" },
    excerpt: { id: "", en: "" },
    body: { id: "", en: "" },
    cover: "",
    category: { id: "", en: "" },
    date: new Date().toISOString().slice(0, 10),
    published: false,
  };

  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<Omit<NewsArticle, "id" | "tenant_id">>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor(item?: NewsArticle) {
    if (item) {
      setEditingId(item.id ?? null);
      setDraft({
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        cover: item.cover,
        category: item.category,
        date: item.date,
        published: item.published,
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

  return (
    <section>
      <div className="section-header">
        <h2>Manajemen Berita</h2>
        <div className="button-group">
          <button onClick={() => openEditor()} className="button-primary">Buat Berita</button>
        </div>
      </div>

      {editorVisible ? (
        <div className="news-editor">
          <div className="editor-header">
            <h3>{editingId ? "Edit Berita" : "Tambah Berita Baru"}</h3>
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
          </div>
          <div className="news-form-grid">
            <label className="field-group">
              <span>Judul (ID)</span>
              <input type="text" value={draft.title.id} onChange={(e) => setDraft((p) => ({ ...p, title: { ...p.title, id: e.target.value } }))} />
            </label>
            <label className="field-group">
              <span>Judul (EN)</span>
              <input type="text" value={draft.title.en} onChange={(e) => setDraft((p) => ({ ...p, title: { ...p.title, en: e.target.value } }))} />
            </label>
            <label className="field-group full-width">
              <span>Excerpt (ID)</span>
              <textarea value={draft.excerpt.id} onChange={(e) => setDraft((p) => ({ ...p, excerpt: { ...p.excerpt, id: e.target.value } }))} />
            </label>
            <label className="field-group full-width">
              <span>Excerpt (EN)</span>
              <textarea value={draft.excerpt.en} onChange={(e) => setDraft((p) => ({ ...p, excerpt: { ...p.excerpt, en: e.target.value } }))} />
            </label>
            <label className="field-group full-width">
              <span>Body (ID)</span>
              <textarea rows={6} value={draft.body.id} onChange={(e) => setDraft((p) => ({ ...p, body: { ...p.body, id: e.target.value } }))} />
            </label>
            <label className="field-group full-width">
              <span>Body (EN)</span>
              <textarea rows={6} value={draft.body.en} onChange={(e) => setDraft((p) => ({ ...p, body: { ...p.body, en: e.target.value } }))} />
            </label>
            <label className="field-group">
              <span>Tanggal</span>
              <input type="date" value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} />
            </label>
            <label className="field-group">
              <span>Cover URL</span>
              <input type="text" value={draft.cover} onChange={(e) => setDraft((p) => ({ ...p, cover: e.target.value }))} />
            </label>
            <label className="field-group checkbox-field">
              <span>Published</span>
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft((p) => ({ ...p, published: e.target.checked }))} />
            </label>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="button-group editor-actions">
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
            <button className="button-primary" onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </div>
      ) : (
        <div className="news-list">
          {loading ? (
            <p>Memuat daftar berita...</p>
          ) : (
            <div>
              {news.map((item) => (
                <article key={item.id} className="news-item">
                  <h3>{item.title?.id ?? item.title?.en}</h3>
                  <div className="news-actions">
                    <button onClick={() => openEditor(item)} className="button-small">Edit</button>
                    <button onClick={() => onDelete(item.id ?? "")} className="button-secondary">Delete</button>
                  </div>
                </article>
              ))}
              <p>{total} items — page {page}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
