import { useEffect, useState } from 'react';
import {
  getTransferDataAdmin,
  updateTransferField,
  deleteTransferField,
  reorderTransferFields
} from '../services/donationService';
import '../styles/AdminComponents.css';


export default function DonationAdmin() {
  const [fields, setFields] = useState([]);
  const [methodId, setMethodId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await getTransferDataAdmin();
    setFields(res.fields);
    setMethodId(res.methodId);
    setLoading(false);
  };

  const toggleVisible = async (field) => {
    setLoading(true);
    await updateTransferField(field.id, {
      visible: !field.visible
    });
    load();
  };

  const updateValue = async (id, value) => {
    setLoading(true);
    await updateTransferField(id, { field_value: value });
    setLoading(false);
  };

  const move = async (index, dir) => {
    const updated = [...fields];
    const target = index + dir;
    if (target < 0 || target >= updated.length) return;

    [updated[index], updated[target]] =
      [updated[target], updated[index]];

    setLoading(true);
    setFields(updated);
    await reorderTransferFields(updated);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar campo?')) return;
    setLoading(true);
    await deleteTransferField(id);
    load();
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title"> Datos de Donación ({fields.length})</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p className="empty-state-text">Cargando...</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <p className="empty-state-text">No hay campos</p>
        </div>
      ) : (
        <div className="admin-card-body">
          {fields.map((f, i) => (
            <div key={f.id} className="item-card">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f5c400', fontSize: '0.9rem' }}>
                  {f.field_key}
                </label>
                <input
                  type="text"
                  value={f.field_value}
                  onChange={e => updateValue(f.id, e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    border: '1px solid #333',
                    background: '#0d0d0d',
                    color: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '0.95rem'
                  }}
                />
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
                  disabled={loading || i === fields.length - 1}
                  title="Bajar"
                >
                  ⬇
                </button>
                <button
                  className="btn btn-success btn-small"
                  onClick={() => toggleVisible(f)}
                  disabled={loading}
                >
                  {f.visible ? '👁' : '🚫'}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(f.id)}
                  disabled={loading}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
