import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, cameFromPasswordRecovery } from '../lib/supabase';

// El enlace del correo "cambiar contraseña" vuelve al sitio con la sesión en la URL;
// Supabase avisa con PASSWORD_RECOVERY y aquí se lleva a la página para elegir la clave
export default function PasswordRecoveryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    if (cameFromPasswordRecovery) navigate('/nueva-clave');
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/nueva-clave');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}
