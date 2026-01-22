import { useEffect, useState } from 'react';
import { getNews, createNews, updateNews, deleteNews } from '../services/newsService';
import '../styles/AdminComponents.css';

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    date: ''
  });

  const loadNews = async () => {
    setLoading(true);
    const data = await getNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', content: '', date: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (editing) {
      await updateNews(editing.id, form);
    } else {
      await createNews(form);
    }

    resetForm();
    loadNews();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      date: item.date
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar noticia?')) return;
    setLoading(true);
    await deleteNews(id);
    loadNews();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* FORMULARIO */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            {editing ? '✏️ Editar' : ' Nueva Noticia'}
          </h2>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              type="text"
              placeholder="Título de la noticia"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenido</label>
            <textarea
              id="content"
              placeholder="Contenido de la noticia"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              style={{ minHeight: '150px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? '⏳ Guardando...' : editing ? '✓ Actualizar' : '✓ Crear'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={resetForm}
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
          <h2 className="admin-card-title"> Noticias ({news.length})</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p className="empty-state-text">Cargando...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <p className="empty-state-text">No hay noticias</p>
          </div>
        ) : (
          <div className="admin-card-body">
            {news.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <div>
                    <strong style={{ color: '#f5c400' }}>{item.title}</strong>
                    <p style={{ margin: '0.4rem 0 0 0', color: '#bbb', fontSize: '0.85rem' }}>
                      {item.date}
                    </p>
                  </div>
                </div>
                <p style={{ margin: '0.8rem 0', fontSize: '0.9rem', color: '#ddd', lineHeight: '1.5' }}>
                  {item.content.substring(0, 100)}...
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                  >
                    🗑 Eliminar
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
