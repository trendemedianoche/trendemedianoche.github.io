import { useEffect, useState } from 'react';
import {
  getUsers,
  updateUserRole,
  toggleUserActive
} from '../services/userService';

import '../styles/AdminComponents.css';

export default function UserAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios: ' + err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    await updateUserRole(userId, newRole);
    load();
  };

  const handleToggleActive = async (userId, currentActive) => {
    setLoading(true);
    await toggleUserActive(userId, !currentActive);
    load();
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">👥 Usuarios ({users.length})</h2>
      </div>

      {error && (
        <div className="admin-alert alert-error" style={{ margin: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p className="empty-state-text">Cargando...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">
            {error ? 'No se pudieron cargar los usuarios' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div className="admin-card-body">
          {users.map(u => (
            <div
              key={u.id}
              className="item-card"
            >
              <div>
                <strong style={{ color: '#f5c400', fontSize: '1.05rem' }}>
                  {u.email}
                </strong>
                {!u.active && <span className="badge badge-inactive">Inactivo</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #333',
                    background: '#0d0d0d',
                    color: '#f5c400',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>

                <button
                  className={`btn ${u.active ? 'btn-danger' : 'btn-success'} btn-small`}
                  onClick={() => handleToggleActive(u.id, u.active)}
                  disabled={loading}
                >
                  {u.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
