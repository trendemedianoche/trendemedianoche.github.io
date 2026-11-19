import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, cameFromPasswordRecovery } from '../lib/supabase';

// El enlace del correo "cambiar contraseña" vuelve al sitio con la sesión en la URL
// (#access_token=...&type=recovery). Antes de cambiar de ruta hay que esperar a que
// Supabase lea ese hash: si navegamos primero, el HashRouter lo reemplaza por
// #/nueva-clave, la sesión se pierde y el token (de un solo uso) ya quedó gastado.
export default function PasswordRecoveryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    if (cameFromPasswordRecovery) {
      // getSession() espera a que el cliente termine de procesar la URL
      supabase.auth.getSession().then(() => navigate('/nueva-clave', { replace: true }));
    }
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/nueva-clave', { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}
