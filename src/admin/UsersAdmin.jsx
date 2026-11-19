import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listUsers, updateUser } from '../services/usersService';

const ROLE_LABEL = { admin: 'Administrador', editor: 'Editor' };

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Nunca';

// Mensaje entendible según el error de Supabase
function describeError(err) {
  if (err?.code === 'PGRST202' || /admin_list_users/.test(err?.message || '')) {
    return 'Falta preparar la base de datos: ejecuta scripts/users-admin-setup.sql en Supabase.';
  }
  if (err?.code === '42501') {
    return 'Solo los administradores pueden ver y editar los usuarios.';
  }
  return err?.message || 'No se pudieron cargar los usuarios.';
}

export default function UsersAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null); // { id, name, role }

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
      setError('');
    } catch (err) {
      setError(describeError(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await updateUser(editing.id, editing);
      setEditing(null);
      setMessage('Usuario actualizado');
      setTimeout(() => setMessage(''), 3000);
      load();
    } catch (err) {
      setMessage('Error: ' + describeError(err));
    }
  };

  return (
    <div>
      {message && (
        <div className={`admin-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Cuentas registradas ({users.length})</h2>
          <p className="form-hint">
            Para agregar una cuenta: Supabase → Authentication → Users → Add user. Aparecerá aquí como Editor.
          </p>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <p className="no-items">{error}</p>
        ) : (
          <div className="posts-list">
            {users.map((u) => {
              const isMe = u.id === user?.id;
              const isEditing = editing?.id === u.id;
              return (
                <div key={u.id} className="post-item" style={{ gridTemplateColumns: '1fr' }}>
                  <div>
                    <div className="post-item-header">
                      <h4>
                        {u.name || u.email.split('@')[0]}
                        {isMe && <span className="form-hint"> (tú)</span>}
                      </h4>
                      <span className={`status-badge ${u.role === 'admin' ? 'published' : 'draft'}`}>
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </div>
                    <div className="post-item-meta">
                      <span>{u.email}</span>
                      <span>Registro: {formatDate(u.created_at)}</span>
                      <span>Último acceso: {formatDate(u.last_sign_in_at)}</span>
                      {!u.confirmed && <span className="text-accent">Correo sin confirmar</span>}
                    </div>

                    {isEditing ? (
                      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
                        <div className="form-group">
                          <label htmlFor={`name-${u.id}`}>Nombre</label>
                          <input
                            id={`name-${u.id}`}
                            type="text"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            placeholder="Nombre para mostrar"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`role-${u.id}`}>Rol</label>
                          <select
                            id={`role-${u.id}`}
                            value={editing.role}
                            onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                            disabled={isMe}
                            title={isMe ? 'No puedes cambiar tu propio rol' : undefined}
                          >
                            <option value="admin">Administrador</option>
                            <option value="editor">Editor</option>
                          </select>
                        </div>
                        <div className="form-actions">
                          <button type="button" className="btn btn-primary btn-small" onClick={save}>
                            Guardar
                          </button>
                          <button type="button" className="btn btn-secondary btn-small" onClick={() => setEditing(null)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="post-item-actions">
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => setEditing({ id: u.id, name: u.name || '', role: u.role || 'editor' })}
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
