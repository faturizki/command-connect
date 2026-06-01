import React from "react";
import type { EventItem } from "@shared/types";

import React, { useState } from "react";
import type { EventItem } from "@shared/types";

interface Props {
  events: EventItem[];
  loading: boolean;
  total: number;
  page: number;
  onCreate: (item: Omit<EventItem, "id" | "tenant_id">) => Promise<void>;
  onUpdate: (id: string, item: Omit<EventItem, "id" | "tenant_id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function EventsSection({ events, loading, total, page, onCreate, onUpdate, onDelete }: Props) {
  const emptyDraft: Omit<EventItem, "id" | "tenant_id"> = {
    title: { id: "", en: "" },
    excerpt: { id: "", en: "" },
    date: new Date().toISOString().slice(0, 10),
    location: { id: "", en: "" },
    cover: "",
    category: { id: "", en: "" },
    finished: false,
  };

  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<Omit<EventItem, "id" | "tenant_id">>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor(item?: EventItem) {
    if (item) {
      setEditingId(item.id ?? null);
      setDraft({
        title: item.title,
        excerpt: item.excerpt,
        date: item.date,
        location: item.location,
        cover: item.cover,
        category: item.category,
        finished: item.finished ?? false,
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
        <h2>Manajemen Kegiatan</h2>
        <div className="button-group">
          <button onClick={() => openEditor()} className="button-primary">Buat Kegiatan</button>
        </div>
      </div>

      {editorVisible ? (
        <div className="event-editor">
          <div className="editor-header">
            <h3>{editingId ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}</h3>
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
              <span>Tanggal</span>
              <input type="date" value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} />
            </label>
            <label className="field-group full-width">
              <span>Lokasi (ID)</span>
              <input type="text" value={draft.location.id} onChange={(e) => setDraft((p) => ({ ...p, location: { ...p.location, id: e.target.value } }))} />
            </label>
            <label className="field-group full-width">
              <span>Lokasi (EN)</span>
              <input type="text" value={draft.location.en} onChange={(e) => setDraft((p) => ({ ...p, location: { ...p.location, en: e.target.value } }))} />
            </label>
            <label className="field-group">
              <span>Cover URL</span>
              <input type="text" value={draft.cover} onChange={(e) => setDraft((p) => ({ ...p, cover: e.target.value }))} />
            </label>
            <label className="field-group checkbox-field">
              <span>Finished</span>
              <input type="checkbox" checked={draft.finished ?? false} onChange={(e) => setDraft((p) => ({ ...p, finished: e.target.checked }))} />
            </label>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="button-group editor-actions">
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
            <button className="button-primary" onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </div>
      ) : (
        <div className="events-list">
          {loading ? (
            <p>Memuat daftar kegiatan...</p>
          ) : (
            <div>
              {events.map((item) => (
                <article key={item.id} className="event-item">
                  <h3>{item.title?.id ?? item.title?.en}</h3>
                  <div className="event-actions">
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
