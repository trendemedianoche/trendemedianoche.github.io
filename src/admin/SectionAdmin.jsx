import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/AdminComponents.css';

export default function SectionAdmin() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSections = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('site_sections')
      .select('*')
      .order('position');

    if (error) {
      console.error('Error loading sections:', error);
      setLoading(false);
      return;
    }

    setSections(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSections();
  }, []);

  const toggleActive = async (section) => {
    setLoading(true);
    await supabase
      .from('site_sections')
      .update({ active: !section.active })
      .eq('id', section.id);

    loadSections();
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;

    const current = sections[index];
    const swap = sections[target];

    setLoading(true);
    await supabase
      .from('site_sections')
      .update({ position: -1 })
      .eq('id', current.id);

    await supabase
      .from('site_sections')
      .update({ position: current.position })
      .eq('id', swap.id);

    await supabase
      .from('site_sections')
      .update({ position: swap.position })
      .eq('id', current.id);

    loadSections();
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">🔀 Secciones del Sitio ({sections.length})</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p className="empty-state-text">Cargando...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔀</div>
          <p className="empty-state-text">No hay secciones</p>
        </div>
      ) : (
        <div className="admin-card-body">
          {sections.map((section, i) => (
            <div
              key={section.id}
              className="item-card"
            >
              <div>
                <strong style={{ color: '#f5c400', fontSize: '1.05rem' }}>
                  {section.label}
                </strong>
                <p style={{ color: '#999', fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>
                  {section.key}
                </p>
                {!section.active && <span className="badge badge-inactive">Inactivo</span>}
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
                  disabled={loading || i === sections.length - 1}
                  title="Bajar"
                >
                  ⬇
                </button>

                <button
                  className="btn btn-success btn-small"
                  onClick={() => toggleActive(section)}
                  disabled={loading}
                >
                  {section.active ? '👁' : '🚫'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
