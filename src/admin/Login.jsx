import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendPasswordReset, describeEmailLimit } from '../services/usersService';

import logoIcon from '../assets/logo-admin.webp';
import logoText from '../assets/letters.webp';
import '../styles/admin.css';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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

  const handleForgot = async () => {
    setError('');
    setNotice('');
    if (!email) return setError('Escribe tu correo y vuelve a pulsar “¿Olvidaste tu contraseña?”');
    try {
      await sendPasswordReset(email);
      setNotice(`Si ${email} tiene acceso, le llegará un correo para elegir una contraseña nueva.`);
    } catch (err) {
      setError(describeEmailLimit(err.message) || err.message);
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
        {notice && <div className="admin-message">{notice}</div>}

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

        <button
          type="button"
          onClick={handleForgot}
          className="mt-4 w-full text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition"
        >
          ¿Olvidaste tu contraseña?
        </button>

        <div className="admin-login-footer">
          Tren de Medianoche · Administración
        </div>
      </div>
    </div>
  );
}
