import React, { useState } from "react";
import type { VideoItem } from "@shared/types";

interface Props {
  videos: VideoItem[];
  loading: boolean;
  total: number;
  page: number;
  onCreate: (video: Omit<VideoItem, "id" | "tenant_id">) => Promise<void>;
  onUpdate: (id: string, video: Omit<VideoItem, "id" | "tenant_id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function VideoSection({ videos, loading, total, page, onCreate, onUpdate, onDelete }: Props) {
  const emptyDraft: Omit<VideoItem, "id" | "tenant_id"> = {
    title: "",
    youtube_id: "",
    description: "",
    thumbnail_url: "",
    published_at: new Date().toISOString().slice(0, 10),
    order: 0,
  };

  const [editorVisible, setEditorVisible] = useState(false);
  const [draft, setDraft] = useState<Omit<VideoItem, "id" | "tenant_id">>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function extractYouTubeId(urlOrId: string): string {
    if (urlOrId.includes("youtube.com") || urlOrId.includes("youtu.be")) {
      const match = urlOrId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : urlOrId;
    }
    return urlOrId;
  }

  function openEditor(item?: VideoItem) {
    if (item) {
      setEditingId(item.id ?? null);
      setDraft({
        title: item.title,
        youtube_id: item.youtube_id,
        description: item.description || "",
        thumbnail_url: item.thumbnail_url || "",
        published_at: item.published_at || new Date().toISOString().slice(0, 10),
        order: item.order || 0,
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
      const youtubeId = extractYouTubeId(draft.youtube_id);
      const dataToSave = { ...draft, youtube_id: youtubeId };

      if (editingId) {
        await onUpdate(editingId, dataToSave);
      } else {
        await onCreate(dataToSave);
      }
      setEditorVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Hapus video ini?")) {
      try {
        await onDelete(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menghapus video");
      }
    }
  }

  const perPage = 10;
  const totalPages = Math.ceil(total / perPage);

  return (
    <section>
      <div className="section-header">
        <h2>Manajemen Video</h2>
        <div className="button-group">
          <button onClick={() => openEditor()} className="button-primary">
            Tambah Video
          </button>
        </div>
      </div>

      {editorVisible ? (
        <div className="editor-panel">
          <h3>{editingId ? "Edit Video" : "Video Baru"}</h3>
          {error && <p className="form-error">{error}</p>}

          <label>
            Judul
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Judul video"
              required
            />
          </label>

          <label>
            YouTube URL atau ID
            <input
              type="text"
              value={draft.youtube_id}
              onChange={(e) => setDraft({ ...draft, youtube_id: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... atau dQw4w9WgXcQ"
              required
            />
          </label>

          <label>
            Deskripsi
            <textarea
              value={draft.description || ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Deskripsi video (opsional)"
              rows={3}
            />
          </label>

          <label>
            URL Thumbnail (opsional)
            <input
              type="text"
              value={draft.thumbnail_url || ""}
              onChange={(e) => setDraft({ ...draft, thumbnail_url: e.target.value })}
              placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg"
            />
          </label>

          <label>
            Tanggal Publikasi
            <input
              type="date"
              value={draft.published_at || ""}
              onChange={(e) => setDraft({ ...draft, published_at: e.target.value })}
            />
          </label>

          <label>
            Urutan (Order)
            <input
              type="number"
              value={draft.order || 0}
              onChange={(e) => setDraft({ ...draft, order: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </label>

          <div className="button-group">
            <button onClick={save} disabled={saving || !draft.title || !draft.youtube_id} className="button-primary">
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
            <p>Memuat video...</p>
          ) : videos.length === 0 ? (
            <p>Belum ada video.</p>
          ) : (
            <div className="list-container">
              <table>
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>YouTube ID</th>
                    <th>Tanggal</th>
                    <th>Urutan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.youtube_id}</td>
                      <td>{item.published_at || "-"}</td>
                      <td>{item.order || 0}</td>
                      <td>
                        <button onClick={() => openEditor(item)} className="button-small">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id!)} className="button-small button-danger">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <p>
                Halaman {page} dari {totalPages} ({total} total)
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
