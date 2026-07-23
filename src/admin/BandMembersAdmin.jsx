import { useEffect, useState } from 'react';
import {
  getAllBandMembers,
  createBandMember,
  updateBandMember,
  deleteBandMember
} from '../services/bandMembersService';
import '../styles/AdminComponents.css';

const EMPTY = { name: '', role: '', note: '', photo_url: '', position: 0, active: true };

export default function BandMembersAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getAllBandMembers());
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
      if (editing) await updateBandMember(editing.id, payload);
      else await createBandMember(payload);
      reset();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
    load();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      role: item.role || '',
      note: item.note || '',
      photo_url: item.photo_url || '',
      position: item.position ?? 0,
      active: item.active ?? true
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar integrante?')) return;
    setLoading(true);
    await deleteBandMember(id);
    load();
  };

  return (
    <div className="news-admin-container">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">{editing ? '✏️ Editar' : 'Nuevo integrante'}</h2>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Guitarra & Voz" />
          </div>
          <div className="form-group">
            <label>Nota</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Foto (URL, opcional)</label>
            <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Orden (posición)</label>
            <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
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
          <h2 className="admin-card-title">Integrantes ({items.length})</h2>
        </div>
        <div className="admin-card-body">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <div>
                  <strong style={{ color: '#f5c400' }}>{item.name}</strong>
                  <p style={{ margin: '0.4rem 0 0', color: '#bbb', fontSize: '0.85rem' }}>
                    {item.role} {item.active ? '' : '(oculto)'}
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
