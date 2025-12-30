import { useEffect, useState } from 'react';
import { getNews, createNews, updateNews, deleteNews } from '../services/newsService';
import '../styles/NewsAdmin.css';

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    date: ''
  });

  const loadNews = async () => {
    const data = await getNews();
    setNews(data);
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
    await deleteNews(id);
    loadNews();
  };

  return (
    <div className="news-admin">
      <header className="admin-header">
        <h2>Noticias</h2>
        <p>Crear, editar y eliminar entradas</p>
      </header>

      <div className="news-admin-layout">
        {/* CREAR / EDITAR */}
        <div className="news-card">
          <h3>
            {editing ? 'Editar noticia' : 'Crear nueva noticia'}
          </h3>

          <form className="news-form" onSubmit={handleSubmit}>
            <label>
              Título
              <input
                type="text"
                placeholder="Título de la noticia"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label>
              Contenido
              <textarea
                rows={5}
                placeholder="Contenido de la noticia"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
            </label>

            <label>
              Fecha
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>

            <div className="news-form-actions">
              <button type="submit" className="primary-btn">
                {editing ? 'Guardar cambios' : 'Crear noticia'}
              </button>

              {editing && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTADO */}
        <div className="news-card">
          <h3>Noticias existentes</h3>

          <div className="news-admin-list">
            {news.map(item => (
              <div key={item.id} className="news-item-row">
                <div className="news-item-info">
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </div>

                <div className="news-item-actions">
                  <button onClick={() => handleEdit(item)} title="Editar">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(item.id)} title="Eliminar">
                    🗑
                  </button>
                </div>
              </div>
            ))}

            {news.length === 0 && (
              <p className="empty">No hay noticias creadas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
