import React, { useState } from "react";
import type { GalleryItem } from "@shared/types";

interface Props {
  gallery: GalleryItem[];
  loading: boolean;
  total: number;
  page: number;
  onCreate: (item: Omit<GalleryItem, "id" | "tenant_id">) => Promise<void>;
  onUpdate: (id: string, item: Omit<GalleryItem, "id" | "tenant_id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function GallerySection({ gallery, loading, total, page, onCreate, onUpdate, onDelete }: Props) {
  const emptyDraft: Omit<GalleryItem, "id" | "tenant_id"> = {
    image: "",
    caption: { id: "", en: "" },
    taken_at: new Date().toISOString().slice(0, 10),
    order: 0,
  };

  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<Omit<GalleryItem, "id" | "tenant_id">>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor(item?: GalleryItem) {
    if (item) {
      setEditingId(item.id ?? null);
      setDraft({
        image: item.image,
        caption: item.caption,
        taken_at: item.taken_at,
        order: item.order,
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
        <h2>Manajemen Galeri</h2>
        <div className="button-group">
          <button onClick={() => openEditor()} className="button-primary">Tambah Foto</button>
        </div>
      </div>

      {editorVisible ? (
        <div className="gallery-editor">
          <div className="editor-header">
            <h3>{editingId ? "Edit Item Galeri" : "Tambah Item Galeri Baru"}</h3>
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
          </div>
          <div className="news-form-grid">
            <label className="field-group full-width">
              <span>Gambar URL</span>
              <input
                type="text"
                value={draft.image}
                onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
              />
            </label>

            <label className="field-group full-width">
              <span>Keterangan (ID)</span>
              <input
                type="text"
                value={draft.caption.id}
                onChange={(e) => setDraft((prev) => ({ ...prev, caption: { ...prev.caption, id: e.target.value } }))}
              />
            </label>

            <label className="field-group full-width">
              <span>Keterangan (EN)</span>
              <input
                type="text"
                value={draft.caption.en}
                onChange={(e) => setDraft((prev) => ({ ...prev, caption: { ...prev.caption, en: e.target.value } }))}
              />
            </label>

            <label className="field-group">
              <span>Tanggal Foto</span>
              <input
                type="date"
                value={draft.taken_at}
                onChange={(e) => setDraft((prev) => ({ ...prev, taken_at: e.target.value }))}
              />
            </label>

            <label className="field-group">
              <span>Urutan</span>
              <input
                type="number"
                value={draft.order}
                onChange={(e) => setDraft((prev) => ({ ...prev, order: Number(e.target.value) }))}
              />
            </label>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="button-group editor-actions">
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
            <button className="button-primary" onClick={save} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      ) : (
        <div className="gallery-list">
          {loading ? (
            <p>Memuat galeri...</p>
          ) : (
            <>
              {gallery.map((item) => (
                <article key={item.id} className="gallery-item">
                  <img src={item.image} alt={item.caption?.id ?? ""} style={{ maxWidth: 200 }} />
                  <div className="gallery-actions">
                    <button onClick={() => openEditor(item)} className="button-small">Edit</button>
                    <button onClick={() => onDelete(item.id ?? "")} className="button-secondary">Delete</button>
                  </div>
                </article>
              ))}
              <p>{total} items — page {page}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
