import { useEffect, useState } from 'react';
import {
  getAllBandMembers,
  createBandMember,
  updateBandMember,
  deleteBandMember
} from '../services/bandMembersService';
import { getPublicPhotos, smallVariant } from '../services/galleryService';

const MAX_PHOTOS = 3;

const memberPhotos = (item) =>
  item.photos?.length ? item.photos : item.photo_url ? [item.photo_url] : [];

const EMPTY = {
  name: '',
  role: '',
  note: '',
  photos: [], // URLs en orden; la primera es la principal
  position: 0,
  active: true
};

export default function BandMembersAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]);

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
    getPublicPhotos().then(setPhotos);
  }, []);

  const reset = () => {
    setEditing(null);
    setForm(EMPTY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { photos: list, ...rest } = form;
      const payload = {
        ...rest,
        photo_url: list[0] || null,
        position: Number(form.position) || 0
      };
      // La columna photos existe solo si se ejecutó scripts/band-member-photos.sql
      const hasPhotosColumn = items.some((i) => 'photos' in i);
      if (hasPhotosColumn) payload.photos = list;
      else if (list.length > 1) {
        alert(
          'Se guardará solo la primera foto. Para guardar varias, ejecuta scripts/band-member-photos.sql en Supabase.'
        );
      }
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
      photos: memberPhotos(item),
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
          <h2 className="admin-card-title">
            {editing ? 'Editar' : 'Nuevo integrante'}
          </h2>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Guitarra & Voz"
            />
          </div>
          <div className="form-group">
            <label>Nota</label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Foto</label>
            {photos.length > 0 ? (
              <>
                <p className="form-hint">
                  Elige hasta {MAX_PHOTOS} fotos de la galería, en orden: la 1
                  es la principal y en la portada se alternan.
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {photos.map((p) => {
                    const order = form.photos.indexOf(p.url);
                    const selected = order !== -1;
                    const full = !selected && form.photos.length >= MAX_PHOTOS;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={full}
                        onClick={() =>
                          setForm({
                            ...form,
                            photos: selected
                              ? form.photos.filter((u) => u !== p.url)
                              : [...form.photos, p.url]
                          })
                        }
                        className={`relative aspect-[2/3] overflow-hidden border-2 transition ${
                          selected
                            ? 'border-primary'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={
                          selected
                            ? 'Quitar esta foto'
                            : full
                              ? `Máximo ${MAX_PHOTOS} fotos`
                              : 'Agregar esta foto'
                        }
                      >
                        <img
                          src={smallVariant(p.url)}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {selected && (
                          <span className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground font-mono text-[0.65rem]">
                            {order + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="form-hint">
                Sube fotos en Galería para poder elegirlas aquí.
              </p>
            )}
            <details className="mt-2">
              <summary className="form-hint cursor-pointer">
                Usar una URL externa
              </summary>
              <input
                className="mt-2"
                value={form.photos[0] || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    photos: [e.target.value, ...form.photos.slice(1)].filter(
                      Boolean
                    )
                  })
                }
                placeholder="https://…"
              />
            </details>
          </div>
          <div className="form-group">
            <label>Orden (posición)</label>
            <input
              type="number"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />{' '}
              Activo
            </label>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? '...' : editing ? 'Actualizar' : 'Crear'}
            </button>
            {editing && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={reset}
              >
                Cancelar
              </button>
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
                <div className="flex items-center gap-4">
                  {memberPhotos(item)[0] ? (
                    <img
                      src={smallVariant(memberPhotos(item)[0])}
                      alt=""
                      className="w-12 h-16 object-cover border border-border"
                    />
                  ) : (
                    <div
                      className="w-12 h-16 border border-dashed border-border"
                      title="Sin foto"
                    />
                  )}
                  <div>
                    <strong>{item.name}</strong>
                    <p
                      style={{
                        margin: '0.4rem 0 0',
                        color: 'var(--muted-foreground)',
                        fontSize: '0.85rem'
                      }}
                    >
                      {item.role} {item.active ? '' : '(oculto)'}
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
              >
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleEdit(item)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
