import { useEffect, useState } from 'react';
import {
  getUsers,
  updateUserRole,
  toggleUserActive
} from '../services/userService';

import '../styles/UserAdmin.css';

export default function UserAdmin() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="user-admin">
      <h2>Administración de usuarios</h2>

      <div className="user-list">
        {users.map(u => (
          <div key={u.id} className={`user-card ${!u.active ? 'inactive' : ''}`}>
            <div>
              <strong>{u.email}</strong>
              <span className="role">{u.role}</span>
            </div>

            <div className="user-actions">
              <select
                value={u.role}
                onChange={e => {
                  updateUserRole(u.id, e.target.value);
                  load();
                }}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>

              <button
                onClick={() => {
                  toggleUserActive(u.id, !u.active);
                  load();
                }}
              >
                {u.active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
