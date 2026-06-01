import React, { useState } from "react";
import type { PressKitItem } from "@shared/types";

interface Props {
  items: PressKitItem[];
  loading: boolean;
  total: number;
  page: number;
  onCreate: (item: Omit<PressKitItem, "id" | "tenant_id">) => Promise<void>;
  onUpdate: (id: string, item: Omit<PressKitItem, "id" | "tenant_id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function PressKitSection({ items, loading, total, page, onCreate, onUpdate, onDelete }: Props) {
  const emptyDraft: Omit<PressKitItem, "id" | "tenant_id"> = {
    name: "",
    file_asset: "",
    size_label: "",
    type: "",
    order: 0,
  };

  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<Omit<PressKitItem, "id" | "tenant_id">>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor(item?: PressKitItem) {
    if (item) {
      setEditingId(item.id ?? null);
      setDraft({
        name: item.name,
        file_asset: item.file_asset,
        size_label: item.size_label,
        type: item.type,
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
        <h2>Manajemen Press Kit</h2>
        <div className="button-group">
          <button onClick={() => openEditor()} className="button-primary">Tambah Item</button>
        </div>
      </div>

      {editorVisible ? (
        <div className="presskit-editor">
          <div className="editor-header">
            <h3>{editingId ? "Edit Item Press Kit" : "Tambah Item Press Kit Baru"}</h3>
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
          </div>
          <div className="news-form-grid">
            <label className="field-group full-width">
              <span>Nama</span>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <label className="field-group full-width">
              <span>Asset File URL</span>
              <input
                type="text"
                value={draft.file_asset}
                onChange={(e) => setDraft((prev) => ({ ...prev, file_asset: e.target.value }))}
              />
            </label>
            <label className="field-group full-width">
              <span>Label Ukuran</span>
              <input
                type="text"
                value={draft.size_label}
                onChange={(e) => setDraft((prev) => ({ ...prev, size_label: e.target.value }))}
              />
            </label>
            <label className="field-group full-width">
              <span>Tipe</span>
              <input
                type="text"
                value={draft.type}
                onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
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
        <div className="presskit-list">
          {loading ? (
            <p>Memuat press kit...</p>
          ) : (
            <>
              {items.map((item) => (
                <article key={item.id} className="presskit-item">
                  <h3>{item.name}</h3>
                  <div className="presskit-actions">
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
