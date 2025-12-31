import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/SectionAdmin.css';

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
    <div className="section-admin">
      <h2>Gestión de secciones</h2>

      {sections.map((section, i) => (
        <div
          key={section.id}
          className={`section-row ${!section.active ? 'inactive' : ''}`}
        >
          <div className="section-info">
            <strong>{section.label}</strong>
            <span>{section.key}</span>
          </div>

          <div className="section-actions">
            <button
              onClick={() => move(i, -1)}
              disabled={loading}
              title="Subir"
            >
              ⬆
            </button>

            <button
              onClick={() => move(i, 1)}
              disabled={loading}
              title="Bajar"
            >
              ⬇
            </button>

            <button
              className="toggle"
              onClick={() => toggleActive(section)}
              disabled={loading}
            >
              {section.active ? '👁' : '🚫'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
