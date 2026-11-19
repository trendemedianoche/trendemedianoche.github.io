import { createClient } from '@supabase/supabase-js';

// Si se llega desde el correo "cambiar contraseña", la URL trae type=recovery.
// Se anota antes de crear el cliente, porque Supabase limpia la URL al leer la sesión.
export const cameFromPasswordRecovery = /[#&?]type=recovery\b/.test(window.location.hash + window.location.search);

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
