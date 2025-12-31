import { useEffect, useState } from 'react';
import {
  getSiteSections,
  createSiteSection,
  updateSiteSection,
  deleteSiteSection
} from '../services/siteSectionsService';
import '../styles/SectionAdmin.css';

export default function SectionAdmin() {
  const [sections, setSections] = useState([]);
  const [newKey, setNewKey] = useState('');

  const loadSections = async () => {
    const data = await getSiteSections();
    setSections(data);
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleCreate = async () => {
    if (!newKey.trim()) return;

    await createSiteSection({
      key: newKey,
      position: sections.length + 1
    });

    setNewKey('');
    loadSections();
  };

  return (
    <div className="section-admin">
      <h2>Gestión de Secciones</h2>

      {/* CREAR */}
      <div className="section-create">
        <input
          placeholder="key sección (ej: news)"
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
        />
        <button onClick={handleCreate}>Agregar</button>
      </div>

      {/* LISTA */}
      {sections.map(section => (
        <div
          key={section.id}
          className={`section-row ${!section.active ? 'inactive' : ''}`}
        >
          <div className="section-info">
            <input
              value={section.key}
              onChange={e =>
                updateSiteSection(section.id, { key: e.target.value })
              }
            />
            <span>Posición: {section.position}</span>
          </div>

          <div className="section-actions">
            <button
              onClick={() =>
                updateSiteSection(section.id, {
                  active: !section.active
                }).then(loadSections)
              }
            >
              {section.active ? '👁' : '🚫'}
            </button>

            <button
              className="danger"
              onClick={() => {
                if (confirm('¿Eliminar sección?')) {
                  deleteSiteSection(section.id).then(loadSections);
                }
              }}
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
