import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LANDING_SECTIONS } from '../lib/landingSections';

const MIGRATION_FILE = 'scripts/site-sections-texts.sql';

// Une las filas de la tabla con las secciones conocidas de la portada
function mergeSections(rows) {
  return LANDING_SECTIONS.map((def) => {
    const row = rows.find((r) => r.key === def.key);
    return {
      ...def,
      id: row?.id ?? null,
      active: def.fixed ? true : row?.active !== false,
      position: def.fixed ? -1 : (row?.position ?? 1e6),
      eyebrow: row?.eyebrow ?? def.eyebrow,
      title: row?.title || def.title,
      intro: row?.intro ?? def.intro,
      extra: { ...def.extra, ...(row?.extra || {}) }
    };
  }).sort((a, b) => a.position - b.position);
}

export default function SectionAdmin() {
  const [sections, setSections] = useState([]);
  const [hasTextColumns, setHasTextColumns] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState(null);

  const loadSections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_sections')
      .select('*')
      .order('position');
    if (error) {
      console.error('Error loading sections:', error);
      setMessage({
        type: 'error',
        text: 'No se pudieron cargar las secciones.'
      });
      setLoading(false);
      return;
    }
    // Sin la migración, la tabla no trae columnas de texto y sus claves son
    // del sitio antiguo: se muestran las secciones con su orden por defecto
    const migrated = data.length === 0 || 'eyebrow' in data[0];
    const known = migrated
      ? data.filter((r) => LANDING_SECTIONS.some((s) => s.key === r.key))
      : [];
    setHasTextColumns(migrated);
    setSections(mergeSections(known));
    setLoading(false);
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Guarda una sección: actualiza su fila o la crea si aún no existe
  const saveRow = async (section, updates) => {
    const payload = { ...updates, updated_at: new Date().toISOString() };
    const query = section.id
      ? supabase.from('site_sections').update(payload).eq('id', section.id)
      : supabase.from('site_sections').insert({ key: section.key, ...payload });
    const { error } = await query;
    if (error) throw error;
  };

  const run = async (fn, okText) => {
    setLoading(true);
    setMessage(null);
    try {
      await fn();
      if (okText) setMessage({ type: 'ok', text: okText });
    } catch (err) {
      console.error('Error guardando sección:', err);
      setMessage({
        type: 'error',
        text: hasTextColumns
          ? 'No se pudo guardar. Revisa la conexión e intenta de nuevo.'
          : `No se pudo guardar: falta actualizar la base de datos (${MIGRATION_FILE}).`
      });
    }
    await loadSections();
  };

  const movable = sections.filter((s) => !s.fixed);

  const move = (key, dir) =>
    run(async () => {
      const order = movable.map((s) => s.key);
      const i = order.indexOf(key);
      const j = i + dir;
      if (j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j], order[i]];
      // Reescribe posiciones 1..n para que queden limpias
      for (const [pos, k] of order.entries()) {
        const s = movable.find((x) => x.key === k);
        if (s.position !== pos + 1 || !s.id)
          await saveRow(s, { position: pos + 1, active: s.active });
      }
    });

  const toggleActive = (section) =>
    run(() =>
      saveRow(section, {
        active: !section.active,
        position: section.position < 1e6 ? section.position : 99
      })
    );

  const startEdit = (section) => {
    setEditingKey(section.key);
    setMessage(null);
    setForm({
      eyebrow: section.eyebrow || '',
      title: section.title || '',
      intro: section.intro || '',
      stats: section.extra?.stats
        ? section.extra.stats.map((s) => ({ ...s }))
        : null
    });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setForm(null);
  };

  const saveTexts = (section) =>
    run(async () => {
      const extra = form.stats
        ? {
            ...section.extra,
            stats: form.stats.filter((s) => s.n.trim() || s.l.trim())
          }
        : section.extra;
      await saveRow(section, {
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        intro: form.intro.trim(),
        extra,
        active: section.active,
        position:
          section.position < 0
            ? 0
            : section.position < 1e6
              ? section.position
              : 99
      });
      cancelEdit();
    }, 'Textos guardados. Ya se ven en la portada.');

  const setStat = (i, field, value) =>
    setForm((f) => ({
      ...f,
      stats: f.stats.map((s, j) => (j === i ? { ...s, [field]: value } : s))
    }));

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Orden, visibilidad y textos</h2>
      </div>

      <div className="admin-card-body">
        {!hasTextColumns && (
          <div className="admin-notice">
            Para editar los textos falta actualizar la base de datos: ejecuta{' '}
            <code>{MIGRATION_FILE}</code> en el editor SQL de Supabase. Mientras
            tanto la portada muestra los textos por defecto.
          </div>
        )}

        <p className="form-hint" style={{ marginBottom: '1.25rem' }}>
          Usa las flechas para cambiar el orden en la portada y el ojo para
          mostrar u ocultar una sección. Los cambios se ven al recargar el
          sitio.
        </p>

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

        {sections.map((section) => {
          const i = movable.findIndex((s) => s.key === section.key);
          const editing = editingKey === section.key;
          return (
            <div
              key={section.key}
              className="item-card"
              style={{ opacity: section.active ? 1 : 0.6 }}
            >
              <div className="item-header" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: '1.05rem' }}>
                    {section.label}
                  </strong>
                  {!section.active && (
                    <span
                      className="badge badge-inactive"
                      style={{ marginLeft: '0.6rem' }}
                    >
                      Oculta
                    </span>
                  )}
                  {section.fixed && (
                    <span className="badge" style={{ marginLeft: '0.6rem' }}>
                      Siempre primero
                    </span>
                  )}
                  {!editing && (
                    <p
                      style={{
                        color: 'var(--muted-foreground)',
                        fontSize: '0.85rem',
                        margin: '0.35rem 0 0'
                      }}
                    >
                      {section.title
                        ? section.title.replace(/\*/g, '').replace(/\n/g, ' ')
                        : section.hint}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    flexShrink: 0
                  }}
                >
                  {!section.fixed && (
                    <>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => move(section.key, -1)}
                        disabled={loading || !hasTextColumns || i <= 0}
                        title="Subir"
                        aria-label={`Subir ${section.label}`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => move(section.key, 1)}
                        disabled={
                          loading || !hasTextColumns || i === movable.length - 1
                        }
                        title="Bajar"
                        aria-label={`Bajar ${section.label}`}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => toggleActive(section)}
                        disabled={loading || !hasTextColumns}
                        title={
                          section.active
                            ? 'Ocultar en la portada'
                            : 'Mostrar en la portada'
                        }
                        aria-label={
                          section.active
                            ? `Ocultar ${section.label}`
                            : `Mostrar ${section.label}`
                        }
                      >
                        {section.active ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}
                      </button>
                    </>
                  )}
                  {!editing && (
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => startEdit(section)}
                      disabled={loading || !hasTextColumns}
                      title="Editar textos"
                    >
                      <Pencil size={14} /> Textos
                    </button>
                  )}
                </div>
              </div>

              {editing && form && (
                <div className="admin-form" style={{ marginTop: '1.25rem' }}>
                  <div className="form-group">
                    <label>Etiqueta superior</label>
                    <input
                      value={form.eyebrow}
                      onChange={(e) =>
                        setForm({ ...form, eyebrow: e.target.value })
                      }
                    />
                  </div>

                  {section.key !== 'lanzamiento' && (
                    <div className="form-group">
                      <label>Título</label>
                      <textarea
                        rows={2}
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                      />
                      <span className="form-hint">
                        Escribe *así* para la parte en cursiva ámbar. Con Enter
                        partes el título en dos líneas.
                      </span>
                    </div>
                  )}

                  {[
                    'hero',
                    'banda',
                    'fechas',
                    'galeria',
                    'apoyo',
                    'contacto'
                  ].includes(section.key) && (
                    <div className="form-group">
                      <label>Texto</label>
                      <textarea
                        rows={3}
                        value={form.intro}
                        onChange={(e) =>
                          setForm({ ...form, intro: e.target.value })
                        }
                      />
                      {section.hint && (
                        <span className="form-hint">{section.hint}</span>
                      )}
                    </div>
                  )}

                  {form.stats && (
                    <div className="form-group">
                      <label>Cifras</label>
                      {form.stats.map((s, j) => (
                        <div
                          key={j}
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <input
                            value={s.n}
                            onChange={(e) => setStat(j, 'n', e.target.value)}
                            placeholder="2017"
                            aria-label="Número"
                            style={{ maxWidth: '7rem' }}
                          />
                          <input
                            value={s.l}
                            onChange={(e) => setStat(j, 'l', e.target.value)}
                            placeholder="Fundación"
                            aria-label="Descripción"
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                stats: f.stats.filter((_, k) => k !== j)
                              }))
                            }
                            title="Quitar cifra"
                            aria-label="Quitar cifra"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {form.stats.length < 4 && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              stats: [...f.stats, { n: '', l: '' }]
                            }))
                          }
                          style={{ alignSelf: 'flex-start' }}
                        >
                          <Plus size={14} /> Agregar cifra
                        </button>
                      )}
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => saveTexts(section)}
                      disabled={loading}
                    >
                      {loading ? 'Guardando…' : 'Guardar textos'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancelEdit}
                      disabled={loading}
                    >
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
