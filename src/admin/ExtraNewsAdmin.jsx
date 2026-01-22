import { useEffect, useState } from 'react';
import {
  getExtraNewsItems,
  createExtraNewsItem,
  updateExtraNewsItem,
  deleteExtraNewsItem
} from '../services/extraNewsService';

import '../styles/AdminComponents.css';

export default function ExtraNewsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    icon: '',
    content: '',
    active: true
  });

  const loadItems = async () => {
    setLoading(true);
    const data = await getExtraNewsItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      await updateExtraNewsItem(editing.id, form);
    } else {
      const nextPosition =
        items.length > 0
          ? Math.max(...items.map(i => i.position)) + 1
          : 1;
      await createExtraNewsItem({
        ...form,
        position: nextPosition
      });
    }

    setForm({ icon: '', content: '', active: true });
    setEditing(null);
    loadItems();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      icon: item.icon,
      content: item.content,
      active: item.active
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar?')) return;
    setLoading(true);
    await deleteExtraNewsItem(id);
    loadItems();
  };

  const toggleActive = async (item) => {
    setLoading(true);
    await updateExtraNewsItem(item.id, { active: !item.active });
    loadItems();
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;

    const a = items[index];
    const b = items[target];

    setLoading(true);
    await updateExtraNewsItem(a.id, { position: -1 });
    await updateExtraNewsItem(b.id, { position: a.position });
    await updateExtraNewsItem(a.id, { position: b.position });
    loadItems();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* FORMULARIO */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            {editing ? '✏️ Editar' : ' Nueva Extra'}
          </h2>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="icon">Icono</label>
            <input
              id="icon"
              type="text"
              placeholder="Ej: 🔥 📅 ⚡"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenido</label>
            <textarea
              id="content"
              placeholder="Contenido del anuncio"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              style={{ minHeight: '100px' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#f5c400', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Activo
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? '⏳ Guardando...' : editing ? '✓ Actualizar' : '✓ Crear'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setEditing(null);
                  setForm({ icon: '', content: '', active: true });
                }}
              >
                ✕ Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTADO */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title"> Extra ({items.length})</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p className="empty-state-text">Cargando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p className="empty-state-text">No hay extras</p>
          </div>
        ) : (
          <div className="admin-card-body">
            {items.map((item, i) => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <div>
                    <strong style={{ color: '#f5c400', fontSize: '1.1rem' }}>
                      {item.icon} {item.content.substring(0, 40)}...
                    </strong>
                    {!item.active && <span className="badge badge-inactive">Inactivo</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => move(i, -1)}
                    disabled={loading || i === 0}
                    title="Subir"
                  >
                    ⬆
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => move(i, 1)}
                    disabled={loading || i === items.length - 1}
                    title="Bajar"
                  >
                    ⬇
                  </button>
                  <button
                    className="btn btn-success btn-small"
                    onClick={() => toggleActive(item)}
                    disabled={loading}
                  >
                    {item.active ? '👁' : '🚫'}
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
