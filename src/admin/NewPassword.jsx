import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

import logoIcon from '../assets/logo-admin.webp';
import logoText from '../assets/letters.webp';
import '../styles/admin.css';

// Se llega aquí desde el enlace del correo "cambiar contraseña" (ver PasswordRecoveryRedirect)
export default function NewPassword() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (password !== repeat) return setError('Las contraseñas no coinciden');
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) setError('No se pudo guardar: ' + error.message);
    else navigate('/admin');
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img src={logoIcon} alt="Logo icon" className="logo-icon" />
          <img src={logoText} alt="Logo text" className="logo-text-login" />
        </div>

        <span className="access-label">Nueva contraseña</span>

        {!loading && !user ? (
          <div className="admin-login-error">
            El enlace venció o ya se usó. Pide uno nuevo con “¿Olvidaste tu contraseña?” en el login.
          </div>
        ) : (
          <>
            {error && <div className="admin-login-error">{error}</div>}
            <form onSubmit={handleSubmit} className="admin-login-form">
              <input
                type="password"
                placeholder="Contraseña nueva"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <input
                type="password"
                placeholder="Repite la contraseña"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}

        <div className="admin-login-footer">Tren de Medianoche · Administración</div>
      </div>
    </div>
  );
}
