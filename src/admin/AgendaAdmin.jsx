import { useEffect, useState } from 'react';
import { ExternalLink, Image as ImageIcon, Plus, Sparkles } from 'lucide-react';
import { getAllEvents, saveEvent, setEventStatus, deleteEvent, todayISO } from '../services/eventsService';

const EMPTY = {
  title: '',
  event_date: '',
  event_time: '',
  venue: '',
  city: '',
  address: '',
  price: '',
  ticket_url: '',
  notes: ''
};

const FILTERS = [
  ['pending', 'Por revisar'],
  ['upcoming', 'Próximas'],
  ['past', 'Pasadas'],
  ['hidden', 'Ocultas']
];

const SOURCE_LABEL = { instagram: 'Instagram', facebook: 'Facebook', story: 'Historia', manual: 'Manual' };

export default function AgendaAdmin() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');

  const load = async () => setEvents(await getAllEvents());

  useEffect(() => {
    load();
  }, []);

  const today = todayISO();
  const FILTER_FNS = {
    pending: (e) => e.status === 'pending',
    upcoming: (e) => e.status === 'published' && e.event_date >= today,
    past: (e) => e.status === 'published' && e.event_date < today,
    hidden: (e) => e.status === 'hidden'
  };
  const visible = events
    .filter(FILTER_FNS[filter])
    .sort((a, b) => (filter === 'upcoming' ? a.event_date.localeCompare(b.event_date) : 0));

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, ...rest } = form;
      const fields = Object.fromEntries(
        Object.keys(EMPTY).map((k) => [k, rest[k]?.trim() ? rest[k].trim() : k === 'title' ? '' : null])
      );
      await saveEvent(id ? { id, ...fields } : fields);
      setForm(null);
      flash(id ? 'Fecha actualizada' : 'Fecha agregada');
      load();
    } catch (err) {
      flash('Error al guardar: ' + err.message);
    }
  };

  const handleStatus = async (event, status) => {
    await setEventStatus(event.id, status);
    flash(status === 'published' ? 'Fecha publicada' : 'Fecha oculta');
    load();
  };

  const handleDelete = async (event) => {
    if (!window.confirm('¿Eliminar esta fecha?')) return;
    await deleteEvent(event.id);
    load();
  };

  const formatDate = (value) => {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const field = (key, label, props = {}) => (
    <div className="form-group">
      <label htmlFor={`ev-${key}`}>{label}</label>
      <input
        id={`ev-${key}`}
        type="text"
        value={form[key] || ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...props}
      />
    </div>
  );

  return (
    <div>
      {message && (
        <div className={`admin-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</div>
      )}

      {form && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">{form.id ? 'Editar fecha' : 'Nueva fecha'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="admin-form">
            {field('title', 'Título', { required: true, placeholder: 'Teletón 2026' })}
            <div className="grid sm:grid-cols-2 gap-4">
              {field('event_date', 'Fecha', { type: 'date', required: true })}
              {field('event_time', 'Hora', { type: 'time' })}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {field('venue', 'Lugar', { placeholder: 'Bar La Puerta Amarilla' })}
              {field('city', 'Comuna / ciudad', { placeholder: 'La Reina, Santiago' })}
            </div>
            {field('address', 'Dirección')}
            <div className="grid sm:grid-cols-2 gap-4">
              {field('price', 'Entrada', { placeholder: '$3.000 · Gratis' })}
              {field('ticket_url', 'Link de entradas', { type: 'url', placeholder: 'https://' })}
            </div>
            {field('notes', 'Notas internas')}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {form.id ? 'Guardar cambios' : 'Agregar fecha'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setForm(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="post-filters">
            {FILTERS.map(([id, label]) => (
              <button key={id} type="button" className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>
                {label} ({events.filter(FILTER_FNS[id]).length})
              </button>
            ))}
          </div>
          {!form && (
            <button type="button" className="btn btn-primary btn-small" onClick={() => setForm({ ...EMPTY })}>
              <Plus size={14} /> Nueva fecha
            </button>
          )}
        </div>

        {filter === 'pending' && (
          <p className="form-hint mb-4 inline-flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            Detectadas automáticamente en publicaciones e historias. Revisa los datos antes de publicar.
          </p>
        )}

        {visible.length === 0 ? (
          <p className="no-items">No hay fechas en esta vista</p>
        ) : (
          <div className="posts-list">
            {visible.map((ev) => (
              <div key={ev.id} className="post-item">
                {ev.image_url ? (
                  <a href={ev.image_url} target="_blank" rel="noreferrer">
                    <img src={ev.image_url} alt="" loading="lazy" className="post-thumb" />
                  </a>
                ) : (
                  <div className="post-thumb post-thumb-empty">
                    <ImageIcon size={20} strokeWidth={1.4} />
                  </div>
                )}
                <div>
                  <div className="post-item-header">
                    <h4>{ev.title}</h4>
                    <span className={`status-badge ${ev.status === 'published' ? 'published' : 'draft'}`}>
                      {ev.status === 'published' ? 'Publicada' : ev.status === 'hidden' ? 'Oculta' : 'Por revisar'}
                    </span>
                  </div>
                  <div className="post-item-meta">
                    <span>
                      {formatDate(ev.event_date)}
                      {ev.event_time ? ` · ${ev.event_time} h` : ''}
                    </span>
                    {(ev.venue || ev.city) && <span>{[ev.venue, ev.city].filter(Boolean).join(' · ')}</span>}
                    {ev.price && <span>{ev.price}</span>}
                    {ev.source_url ? (
                      <a href={ev.source_url} target="_blank" rel="noreferrer" className="source-chip">
                        {SOURCE_LABEL[ev.source] || ev.source} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span>{SOURCE_LABEL[ev.source] || ev.source}</span>
                    )}
                  </div>
                  {ev.notes && <p className="form-hint mb-3">{ev.notes}</p>}
                  <div className="post-item-actions">
                    {ev.status !== 'published' && (
                      <button className="btn-approve" onClick={() => handleStatus(ev, 'published')}>
                        Publicar
                      </button>
                    )}
                    {ev.status === 'published' && (
                      <button className="btn-toggle" onClick={() => handleStatus(ev, 'hidden')}>
                        Ocultar
                      </button>
                    )}
                    <button className="btn-edit" onClick={() => setForm({ ...EMPTY, ...ev })}>
                      Editar
                    </button>
                    {ev.status === 'pending' && (
                      <button className="btn-toggle" onClick={() => handleStatus(ev, 'hidden')}>
                        Descartar
                      </button>
                    )}
                    <button className="btn-delete" onClick={() => handleDelete(ev)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
