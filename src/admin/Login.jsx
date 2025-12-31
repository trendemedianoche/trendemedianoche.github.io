import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import logoIcon from '../assets/logo.png';
import logoText from '../assets/letters.png';

import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError('Acceso denegado');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">

        {/* LOGOS */}
        <div className="admin-login-logo">
          <img src={logoIcon} alt="Logo icon" className="logo-icon" />
          <img src={logoText} alt="Logo text" className="logo-text-login" />
        </div>

        <span className="access-label">Acceso restringido</span>

        {/* ERROR */}
        {error && <div className="admin-login-error">{error}</div>}

        {/* FORM */}
        <form onSubmit={handleLogin} className="admin-login-form">
          <input
            type="email"
            placeholder="Correo administrador"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Ingresar</button>
        </form>

        <div className="admin-login-footer">
          Tren de Medianoche · Administración
        </div>
      </div>
    </div>
  );
}
