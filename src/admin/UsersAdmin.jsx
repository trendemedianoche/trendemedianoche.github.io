import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  listUsers,
  updateUser,
  createAccess,
  sendPasswordReset,
  setUserAccess,
  confirmUserEmail,
  deleteUser
} from '../services/usersService';

const ROLE_LABEL = { admin: 'Administrador', editor: 'Editor' };
const NEW_ACCESS = { email: '', name: '', role: 'editor', password: '' };

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

// Contraseña inicial aleatoria y legible (sin caracteres ambiguos)
function randomPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(bytes, (n) => chars[n % chars.length]).join('');
}

// Mensaje entendible según el error de Supabase
function describeError(err) {
  const msg = err?.message || '';
  if (err?.code === 'PGRST202') {
    return /admin_list_users|admin_update_user/.test(msg)
      ? 'Falta preparar la base de datos: ejecuta scripts/users-admin-setup.sql en Supabase.'
      : 'Esta acción necesita scripts/users-admin-v2.sql: ejecútalo en Supabase.';
  }
  if (err?.code === '42501') return 'Solo los administradores pueden hacer esto.';
  if (/signups? not allowed|signup is disabled/i.test(msg)) {
    return 'Supabase tiene desactivado el registro: actívalo en Authentication → Sign In / Providers → "Allow new users to sign up".';
  }
  if (/rate limit/i.test(msg)) return 'Se enviaron demasiados correos seguidos. Espera unos minutos y vuelve a intentarlo.';
  if (/password/i.test(msg) && /characters|weak|short/i.test(msg)) return 'La contraseña es muy corta o débil (mínimo 6 caracteres).';
  return msg || 'No se pudo completar la acción.';
}

export default function UsersAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null); // { id, name, role }
  const [creating, setCreating] = useState(null); // formulario de nuevo acceso
  const [created, setCreated] = useState(null); // datos para compartir tras crear
  const [busy, setBusy] = useState(false);

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 5000);
  };

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

  // Ejecuta una acción, muestra el resultado y recarga la lista
  const run = async (action, okText) => {
    setBusy(true);
    try {
      await action();
      flash(okText);
      await load();
    } catch (err) {
      flash('Error: ' + describeError(err));
    }
    setBusy(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { needsConfirmation } = await createAccess(creating);
      setCreated({ ...creating, needsConfirmation });
      setCreating(null);
      await load();
    } catch (err) {
      flash('Error: ' + describeError(err));
    }
    setBusy(false);
  };

  return (
    <div>
      {message && (
        <div className={`admin-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</div>
      )}

      {created && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Acceso creado</h2>
          </div>
          <p className="form-hint mb-3">
            Comparte estos datos con {created.name || created.email} por un medio privado. Podrá cambiar la contraseña
            después con “¿Olvidaste tu contraseña?” en el login.
          </p>
          <div className="admin-preview font-mono text-sm space-y-1">
            <div>Sitio: {window.location.origin}/#/login</div>
            <div>Correo: {created.email}</div>
            <div>Contraseña: {created.password}</div>
          </div>
          {created.needsConfirmation && (
            <p className="form-hint mt-3">
              Le llegó un correo para confirmar su cuenta: debe confirmarlo antes de entrar. Si no le llega, usa
              “Confirmar correo” en su ficha.
            </p>
          )}
          <div className="form-actions mt-4">
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => {
                navigator.clipboard?.writeText(
                  `Sitio: ${window.location.origin}/#/login\nCorreo: ${created.email}\nContraseña: ${created.password}`
                );
                flash('Datos copiados');
              }}
            >
              Copiar datos
            </button>
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setCreated(null)}>
              Listo
            </button>
          </div>
        </div>
      )}

      {creating && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Nuevo acceso</h2>
          </div>
          <form className="admin-form" onSubmit={handleCreate}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="new-email">Correo</label>
                <input
                  id="new-email"
                  type="email"
                  required
                  value={creating.email}
                  onChange={(e) => setCreating({ ...creating, email: e.target.value.trim() })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-name">Nombre</label>
                <input
                  id="new-name"
                  type="text"
                  value={creating.name}
                  onChange={(e) => setCreating({ ...creating, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-role">Rol</label>
                <select
                  id="new-role"
                  value={creating.role}
                  onChange={(e) => setCreating({ ...creating, role: e.target.value })}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="new-password">Contraseña inicial</label>
                <input
                  id="new-password"
                  type="text"
                  required
                  minLength={6}
                  value={creating.password}
                  onChange={(e) => setCreating({ ...creating, password: e.target.value })}
                />
              </div>
            </div>
            <p className="form-hint">
              Editor: edita el contenido del sitio. Administrador: además gestiona los usuarios.
            </p>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? 'Creando…' : 'Crear acceso'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setCreating(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Cuentas registradas ({users.length})</h2>
          {!creating && !error && (
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={() => {
                setCreated(null);
                setCreating({ ...NEW_ACCESS, password: randomPassword() });
              }}
            >
              <UserPlus size={14} /> Nuevo acceso
            </button>
          )}
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
                      <div className="flex gap-2 flex-wrap justify-end">
                        {u.suspended && <span className="status-badge">Suspendida</span>}
                        <span className={`status-badge ${u.role === 'admin' ? 'published' : 'draft'}`}>
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                      </div>
                    </div>
                    <div className="post-item-meta">
                      <span>{u.email}</span>
                      <span>Registro: {formatDate(u.created_at)}</span>
                      <span>Último acceso: {formatDate(u.last_sign_in_at)}</span>
                      {u.provider && u.provider !== 'email' && <span>Acceso con {u.provider}</span>}
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
                          <button
                            type="button"
                            className="btn btn-primary btn-small"
                            disabled={busy}
                            onClick={() =>
                              run(async () => {
                                await updateUser(editing.id, editing);
                                setEditing(null);
                              }, 'Usuario actualizado')
                            }
                          >
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
                        <button
                          type="button"
                          className="btn-edit"
                          disabled={busy}
                          onClick={() =>
                            run(() => sendPasswordReset(u.email), `Se envió a ${u.email} un enlace para elegir contraseña`)
                          }
                        >
                          Enviar cambio de contraseña
                        </button>
                        {!u.confirmed && (
                          <button
                            type="button"
                            className="btn-approve"
                            disabled={busy}
                            onClick={() => run(() => confirmUserEmail(u.id), 'Correo confirmado')}
                          >
                            Confirmar correo
                          </button>
                        )}
                        {!isMe && (
                          <button
                            type="button"
                            className="btn-toggle"
                            disabled={busy}
                            onClick={() => {
                              if (
                                !u.suspended &&
                                !window.confirm(`¿Suspender el acceso de ${u.email}? Se cerrará su sesión.`)
                              )
                                return;
                              run(
                                () => setUserAccess(u.id, u.suspended),
                                u.suspended ? 'Acceso reactivado' : 'Acceso suspendido'
                              );
                            }}
                          >
                            {u.suspended ? 'Reactivar' : 'Suspender'}
                          </button>
                        )}
                        {!isMe && (
                          <button
                            type="button"
                            className="btn-delete"
                            disabled={busy}
                            onClick={() => {
                              if (!window.confirm(`¿Eliminar la cuenta ${u.email}? No se puede deshacer.`)) return;
                              run(() => deleteUser(u.id), 'Cuenta eliminada');
                            }}
                          >
                            Eliminar
                          </button>
                        )}
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
