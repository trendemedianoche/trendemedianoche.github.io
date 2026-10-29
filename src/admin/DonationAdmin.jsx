import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Save, Trash2 } from 'lucide-react';
import {
  getTransferDataAdmin,
  updateTransferField,
  deleteTransferField,
  reorderTransferFields
} from '../services/donationService';


export default function DonationAdmin() {
  const [fields, setFields] = useState([]);
  const [methodId, setMethodId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

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
    setEditingId(null);
    setEditValue('');
    load();
  };

  const startEdit = (field) => {
    setEditingId(field.id);
    setEditValue(field.field_value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
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
        <h2 className="admin-card-title">Datos de transferencia ({fields.length})</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p className="empty-state-text">Cargando...</p>
        </div>
      ) : fields.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <p className="empty-state-text">No hay datos de donación configurados</p>
        </div>
      ) : (
        <div className="admin-card-body">
          {fields.map((f, i) => (
            <div key={f.id} className="item-card">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                  {f.field_key}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editingId === f.id ? editValue : f.field_value}
                    onChange={e => setEditValue(e.target.value)}
                    disabled={editingId !== f.id}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      border: '1px solid var(--border)',
                      background: editingId === f.id ? 'var(--smoke)' : 'var(--background)',
                      color: 'var(--foreground)',
                      borderRadius: 0,
                      fontSize: '0.95rem',
                      opacity: editingId === f.id ? 1 : 0.7
                    }}
                  />
                  {editingId === f.id ? (
                    <>
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => updateValue(f.id, editValue)}
                        disabled={loading}
                        title="Guardar"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={cancelEdit}
                        disabled={loading}
                        title="Cancelar"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => startEdit(f)}
                      disabled={loading || editingId !== null}
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => move(i, -1)}
                  disabled={loading || i === 0}
                  title="Subir"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => move(i, 1)}
                  disabled={loading || i === fields.length - 1}
                  title="Bajar"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  className="btn btn-success btn-small"
                  onClick={() => toggleVisible(f)}
                  disabled={loading}
                  title={f.visible ? 'Visible' : 'Oculto'}
                >
                  {f.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(f.id)}
                  disabled={loading}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

