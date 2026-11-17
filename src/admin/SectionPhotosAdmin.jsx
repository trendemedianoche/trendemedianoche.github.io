import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  LANDING_SECTIONS,
  pickSectionImages,
  resolveSections
} from '../lib/landingSections';
import { getGalleryImages } from '../services/galleryService';

// Secciones de la portada que muestran una foto de la galería
const IMAGE_SECTIONS = LANDING_SECTIONS.filter((s) => s.image);

// Miniatura liviana: las fotos del bucket público tienen variante -sm
const thumbUrl = (img) => img.url.replace(/-lg\.webp$/, '-sm.webp');

export default function SectionPhotosAdmin() {
  const [rows, setRows] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // clave de la sección guardando
  const [message, setMessage] = useState(null);

  const load = async () => {
    const [{ data, error }, imgs] = await Promise.all([
      supabase.from('site_sections').select('*').order('position'),
      getGalleryImages()
    ]);
    if (error) {
      setMessage({
        type: 'error',
        text: 'No se pudieron cargar las secciones.'
      });
    } else {
      setRows(data);
    }
    setGallery(imgs);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const { text } = resolveSections(rows);
  // Lo que hoy se ve en la portada (elegidas + automáticas)
  const shown = pickSectionImages(gallery, text);
  const chosenId = (key) => text[key]?.extra?.image_id ?? null;

  // Sección (distinta de `key`) que ya eligió esa foto
  const takenBy = (imgId, key) =>
    IMAGE_SECTIONS.find((s) => s.key !== key && chosenId(s.key) === imgId);

  const assign = async (section, imageId) => {
    setSaving(section.key);
    setMessage(null);
    const row = rows.find((r) => r.key === section.key);
    const extra = { ...(row?.extra || {}), image_id: imageId };
    const payload = { extra, updated_at: new Date().toISOString() };
    const { error } = row
      ? await supabase.from('site_sections').update(payload).eq('id', row.id)
      : await supabase
          .from('site_sections')
          .insert({ key: section.key, active: true, position: 99, ...payload });
    if (error) {
      console.error('Error guardando foto de sección:', error);
      setMessage({
        type: 'error',
        text: 'No se pudo guardar. Intenta de nuevo.'
      });
    } else {
      setMessage({
        type: 'ok',
        text: `${section.label}: foto actualizada. Se ve al recargar el sitio.`
      });
      await load();
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card-body">Cargando…</div>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div
          className={
            message.type === 'error'
              ? 'admin-notice admin-notice-error'
              : 'admin-notice admin-notice-ok'
          }
        >
          {message.text}
        </div>
      )}

      <p className="form-hint" style={{ marginBottom: '1.5rem' }}>
        Elige qué foto de la Galería muestra cada sección. Una foto elegida en
        una sección no se puede repetir en otra. En <strong>Automática</strong>{' '}
        la sección toma una foto que ninguna otra esté usando. Para sumar fotos
        nuevas, súbelas primero en Galería.
      </p>

      {gallery.length === 0 && (
        <div className="admin-notice">
          No hay fotos activas en la Galería. Sube o activa alguna para poder
          asignarla.
        </div>
      )}

      {IMAGE_SECTIONS.map((section) => {
        const current = shown[section.key];
        const chosen = chosenId(section.key);
        const isAuto = !gallery.some((g) => g.id === chosen);
        const busy = saving === section.key;
        return (
          <div key={section.key} className="admin-card section-photo-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">{section.label}</h2>
              <span className={isAuto ? 'badge' : 'badge badge-active'}>
                {isAuto ? 'Automática' : 'Elegida'}
              </span>
            </div>

            <div className="admin-card-body section-photo-body">
              <figure className="section-photo-current">
                {current ? (
                  <img src={current.url} alt={current.alt || section.label} />
                ) : (
                  <div className="section-photo-empty">
                    Sin foto libre: se muestra una imagen fija del sitio
                  </div>
                )}
                <figcaption className="form-hint">
                  En la portada ahora
                </figcaption>
              </figure>

              <div className="section-photo-picker">
                <div
                  className="section-photo-grid"
                  role="radiogroup"
                  aria-label={`Foto de ${section.label}`}
                >
                  {gallery.map((img) => {
                    const owner = takenBy(img.id, section.key);
                    const selected = !isAuto && chosen === img.id;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={Boolean(owner) || busy}
                        onClick={() => !selected && assign(section, img.id)}
                        className={`section-photo-option${selected ? ' is-selected' : ''}${owner ? ' is-taken' : ''}`}
                        title={
                          owner
                            ? `Ya se usa en ${owner.label}`
                            : img.alt || `Foto ${img.id}`
                        }
                      >
                        <img
                          src={thumbUrl(img)}
                          alt={img.alt || `Foto ${img.id}`}
                          loading="lazy"
                        />
                        {selected && (
                          <span className="section-photo-check">
                            <Check size={14} />
                          </span>
                        )}
                        {owner && (
                          <span className="section-photo-tag">
                            En {owner.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {!isAuto && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={() => assign(section, null)}
                    disabled={busy}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <RotateCcw size={14} /> Volver a automática
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
