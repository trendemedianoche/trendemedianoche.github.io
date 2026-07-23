import { useEffect, useState } from 'react';
import {
  getAllReleases,
  createRelease,
  updateRelease,
  deleteRelease
} from '../services/releasesService';
import '../styles/AdminComponents.css';

const EMPTY = { year: '', title: '', type: 'Single', note: '', position: 0, active: true };

export default function ReleasesAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getAllReleases());
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
      if (editing) await updateRelease(editing.id, payload);
      else await createRelease(payload);
      reset();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
    load();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      year: item.year || '',
      title: item.title || '',
      type: item.type || '',
      note: item.note || '',
      position: item.position ?? 0,
      active: item.active ?? true
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar lanzamiento?')) return;
    setLoading(true);
    await deleteRelease(id);
    load();
  };

  return (
    <div className="news-admin-container">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">{editing ? '✏️ Editar' : 'Nuevo lanzamiento'}</h2>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Año</label>
            <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" required />
          </div>
          <div className="form-group">
            <label>Título</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Single / EP" />
          </div>
          <div className="form-group">
            <label>Nota</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Orden (posición)</label>
            <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />{' '}
              Activo (visible en la web)
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? '⏳...' : editing ? '✓ Actualizar' : '✓ Crear'}
            </button>
            {editing && (
              <button type="button" className="btn btn-secondary btn-block" onClick={reset}>
                ✕ Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Discografía ({items.length})</h2>
        </div>
        <div className="admin-card-body">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <div>
                  <strong style={{ color: '#f5c400' }}>
                    {item.year} · {item.title}
                  </strong>
                  <p style={{ margin: '0.4rem 0 0', color: '#bbb', fontSize: '0.85rem' }}>
                    {item.type} — {item.note} {item.active ? '' : '(oculto)'}
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
