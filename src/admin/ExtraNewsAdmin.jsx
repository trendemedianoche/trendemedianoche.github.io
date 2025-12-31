import { useEffect, useState } from 'react';
import {
  getExtraNewsItems,
  createExtraNewsItem,
  updateExtraNewsItem,
  deleteExtraNewsItem
} from '../services/extraNewsService';

import '../styles/ExtraNewsAdmin.css';

export default function ExtraNewsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    icon: '',
    content: '',
    active: true
  });

  /* ======================
     LOAD
  ====================== */
  const loadItems = async () => {
    const data = await getExtraNewsItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  /* ======================
     CREATE / UPDATE
  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      await updateExtraNewsItem(editing.id, form);
    } else {
      const nextPosition =
      items.length > 0
        ? Math.max(...items.map(i => i.position))
        + 1
        : 1;
      await createExtraNewsItem({
        ...form,
        position: nextPosition
      });
    }

    setForm({ icon: '', content: '', active: true });
    setEditing(null);
    setLoading(false);
    loadItems();
  };

  /* ======================
     EDIT
  ====================== */
  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      icon: item.icon,
      content: item.content,
      active: item.active
    });
  };

  /* ======================
     DELETE
  ====================== */
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar Extra News?')) return;
    await deleteExtraNewsItem(id);
    loadItems();
  };

  /* ======================
     TOGGLE ACTIVE
  ====================== */
  const toggleActive = async (item) => {
    await updateExtraNewsItem(item.id, {
      active: !item.active
    });
    loadItems();
  };

  /* ======================
     MOVE POSITION
  ====================== */
  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;

    const a = items[index];
    const b = items[target];

    await updateExtraNewsItem(a.id, { position: -1 });
    await updateExtraNewsItem(b.id, { position: a.position });
    await updateExtraNewsItem(a.id, { position: b.position });

    loadItems();
  };

  /* ======================
     JSX
  ====================== */
  return (
    <div className="extra-news-admin">
      <h2>Extra News · Barra superior</h2>

      {/* FORM */}
      <form className="news-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Icono (🔥 📅 ⚡)"
          value={form.icon}
          onChange={(e) =>
            setForm({ ...form, icon: e.target.value })
          }
          required
        />

        <textarea
          placeholder="Contenido (HTML permitido)"
          value={form.content}
          onChange={(e) =>
            setForm({ ...form, content: e.target.value })
          }
          required
        />

        <button className="primary-btn" type="submit" disabled={loading}>
          {editing ? 'Actualizar' : 'Crear'} Extra News
        </button>

        {editing && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditing(null);
              setForm({ icon: '', content: '', active: true });
            }}
          >
            Cancelar edición
          </button>
        )}
      </form>

      {/* LIST */}
      <div className="news-admin-list">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`news-admin-item ${!item.active ? 'inactive' : ''}`}
          >
            <div className="content">
              <strong>{item.icon}</strong>
              <span
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>

            <div className="actions">
              <button onClick={() => move(i, -1)} title="Subir">⬆</button>
              <button onClick={() => move(i, 1)} title="Bajar">⬇</button>
              <button
                onClick={() => toggleActive(item)}
                title={item.active ? 'Ocultar' : 'Mostrar'}
              >
                {item.active ? '👁' : '🚫'}
              </button>
              <button onClick={() => handleEdit(item)} title="Editar">✏️</button>
              <button onClick={() => handleDelete(item.id)} title="Eliminar">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
