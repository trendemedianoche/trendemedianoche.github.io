import { useEffect, useState } from 'react';
import {
  getAllTopTracks,
  createTopTrack,
  updateTopTrack,
  deleteTopTrack
} from '../services/topTracksService';
import '../styles/AdminComponents.css';

const EMPTY = { position: 0, title: '', duration: '', spotify_url: '', active: true };

export default function TopTracksAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getAllTopTracks());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditing(null);
    setForm(EMPTY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, position: Number(form.position) || 0 };
      if (editing) await updateTopTrack(editing.id, payload);
      else await createTopTrack(payload);
      reset();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
    load();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      position: item.position ?? 0,
      title: item.title || '',
      duration: item.duration || '',
      spotify_url: item.spotify_url || '',
      active: item.active ?? true
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar track?')) return;
    setLoading(true);
    await deleteTopTrack(id);
    load();
  };

  return (
    <div className="news-admin-container">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">{editing ? '✏️ Editar' : 'Nuevo track'}</h2>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Posición</label>
            <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Título</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Duración</label>
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="03:28" />
          </div>
          <div className="form-group">
            <label>Link Spotify (opcional)</label>
            <input value={form.spotify_url} onChange={(e) => setForm({ ...form, spotify_url: e.target.value })} placeholder="https://open.spotify.com/..." />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Activo
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? '⏳...' : editing ? '✓ Actualizar' : '✓ Crear'}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary btn-block" onClick={reset}>✕ Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Top tracks ({items.length})</h2>
        </div>
        <div className="admin-card-body">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <div>
                  <strong style={{ color: '#f5c400' }}>
                    {String(item.position).padStart(2, '0')} · {item.title}
                  </strong>
                  <p style={{ margin: '0.4rem 0 0', color: '#bbb', fontSize: '0.85rem' }}>
                    {item.duration} {item.active ? '' : '(oculto)'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn btn-secondary btn-small" onClick={() => handleEdit(item)}>✏️ Editar</button>
                <button className="btn btn-danger btn-small" onClick={() => handleDelete(item.id)}>🗑 Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
