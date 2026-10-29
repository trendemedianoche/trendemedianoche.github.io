import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { ArrowDown, ArrowUp, Bold, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import {
  getExtraNewsItems,
  createExtraNewsItem,
  updateExtraNewsItem,
  deleteExtraNewsItem
} from '../services/extraNewsService';


export default function ExtraNewsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const contentRef = useRef(null);

  // Envuelve la selección en <strong> (o inserta un ejemplo si no hay selección)
  const highlight = () => {
    const el = contentRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = form.content.slice(start, end) || 'texto destacado';
    const content = `${form.content.slice(0, start)}<strong>${selected}</strong>${form.content.slice(end)}`;
    setForm({ ...form, content });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + 8, start + 8 + selected.length);
    }, 0);
  };

  const renderContent = (html) => ({ __html: DOMPurify.sanitize(html, { ALLOWED_TAGS: ['strong', 'b', 'em', 'i'] }) });

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
    <div className="news-admin-container">
      {/* FORMULARIO */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            {editing ? 'Editar aviso' : 'Nuevo aviso'}
          </h2>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="icon">Icono</label>
            <input
              id="icon"
              type="text"
              placeholder="Opcional (por defecto ★). Ej: 🔥 📅 ⚡"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenido</label>
            <div className="text-editor-toolbar">
              <button type="button" className="toolbar-btn inline-flex items-center gap-1.5" onClick={highlight}>
                <Bold size={13} /> Resaltar
              </button>
              <span className="form-hint ml-2">Selecciona una palabra y pulsa Resaltar</span>
            </div>
            <textarea
              id="content"
              ref={contentRef}
              placeholder="Ej: Muy pronto: Príncipe Azul, nuevo single"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              style={{ minHeight: '100px' }}
            />
            {form.content && (
              <div className="admin-preview" style={{ padding: '0.75rem 1rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Así se verá</h4>
                <div
                  className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-muted-foreground [&_strong]:text-primary [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={renderContent(`${form.icon || '★'} ${form.content}`)}
                />
              </div>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--primary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Activo
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
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
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTADO */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Avisos ({items.length})</h2>
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
                    <p
                      className="line-clamp-2 text-foreground [&_strong]:text-primary [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={renderContent(`${item.icon || '★'} ${item.content}`)}
                    />
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
                    <ArrowUp size={14} />
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => move(i, 1)}
                    disabled={loading || i === items.length - 1}
                    title="Bajar"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    className="btn btn-success btn-small"
                    onClick={() => toggleActive(item)}
                    disabled={loading}
                  >
                    {item.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                  >
                    <Trash2 size={14} />
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
