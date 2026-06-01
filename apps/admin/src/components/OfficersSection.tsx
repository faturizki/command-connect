import React, { useState } from "react";
import type { Officer } from "@shared/types";

interface Props {
  officers: Officer[];
  loading: boolean;
  total: number;
  page: number;
  onCreate: (item: Omit<Officer, "id" | "tenant_id">) => Promise<void>;
  onUpdate: (id: string, item: Omit<Officer, "id" | "tenant_id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function OfficersSection({ officers, loading, total, page, onCreate, onUpdate, onDelete }: Props) {
  const emptyDraft: Omit<Officer, "id" | "tenant_id"> = {
    rank_code: "",
    rank: { code: "", name: { id: "", en: "" } },
    name: "",
    position: { name: { id: "", en: "" }, division: { id: "", en: "" } },
    photo: "",
    status: "active",
    term_start: new Date().toISOString().slice(0, 10),
    term_end: new Date().toISOString().slice(0, 10),
    bio: { id: "", en: "" },
  };

  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<Omit<Officer, "id" | "tenant_id">>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor(item?: Officer) {
    if (item) {
      setEditingId(item.id ?? null);
      setDraft({
        rank_code: item.rank_code,
        rank: item.rank,
        name: item.name,
        position: item.position,
        photo: item.photo,
        status: item.status,
        term_start: item.term_start,
        term_end: item.term_end,
        bio: item.bio,
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
        <h2>Manajemen Struktur</h2>
        <div className="button-group">
          <button onClick={() => openEditor()} className="button-primary">Tambah Pejabat</button>
        </div>
      </div>

      {editorVisible ? (
        <div className="officer-editor">
          <div className="editor-header">
            <h3>{editingId ? "Edit Pejabat" : "Tambah Pejabat Baru"}</h3>
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
          </div>
          <div className="news-form-grid">
            <label className="field-group">
              <span>Nama</span>
              <input type="text" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label className="field-group">
              <span>Foto URL</span>
              <input type="text" value={draft.photo} onChange={(e) => setDraft((p) => ({ ...p, photo: e.target.value }))} />
            </label>
            <label className="field-group">
              <span>Status</span>
              <select value={draft.status} onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as any }))}>
                <option value="active">Active</option>
                <option value="past">Past</option>
              </select>
            </label>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="button-group editor-actions">
            <button className="button-secondary" onClick={() => setEditorVisible(false)}>Batal</button>
            <button className="button-primary" onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </div>
      ) : (
        <div className="officers-list">
          {loading ? (
            <p>Memuat daftar pejabat...</p>
          ) : (
            <div>
              {officers.map((item) => (
                <article key={item.id} className="officer-item">
                  <h3>{item.name}</h3>
                  <div className="officer-actions">
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
