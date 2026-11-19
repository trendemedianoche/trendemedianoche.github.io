import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Página a la que llegan los enlaces de correo (cambio de contraseña, confirmación)
export const AUTH_REDIRECT_URL = `${window.location.origin}/`;

/**
 * Cuentas registradas (solo admin; ver scripts/users-admin-setup.sql y users-admin-v2.sql)
 */
export async function listUsers() {
  const { data, error } = await supabase.rpc('admin_list_users');
  if (error) throw error;
  return data || [];
}

/**
 * Cambia nombre y rol ('admin' | 'editor') de una cuenta
 */
export async function updateUser(id, { name, role }) {
  const { error } = await supabase.rpc('admin_update_user', {
    target: id,
    new_name: name || '',
    new_role: role
  });
  if (error) throw error;
}

/**
 * Crea una cuenta nueva con contraseña inicial.
 * Usa un cliente aparte (sin guardar sesión) para que el admin no pierda la suya.
 * Si Supabase exige confirmar el correo, le llega un correo de confirmación.
 */
export async function createAccess({ email, password, name, role }) {
  const signupClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'signup-temp' }
  });
  const { data, error } = await signupClient.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: AUTH_REDIRECT_URL }
  });
  if (error) throw error;
  // Supabase no revela si el correo ya existía: en ese caso no trae identidades
  if (!data.user || data.user.identities?.length === 0) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }
  await updateUser(data.user.id, { name, role });
  return { needsConfirmation: !data.session };
}

/**
 * Envía el correo para elegir una contraseña nueva
 */
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: AUTH_REDIRECT_URL });
  if (error) throw error;
}

export async function setUserAccess(id, enabled) {
  const { error } = await supabase.rpc('admin_set_access', { target: id, enabled });
  if (error) throw error;
}

export async function confirmUserEmail(id) {
  const { error } = await supabase.rpc('admin_confirm_email', { target: id });
  if (error) throw error;
}

export async function deleteUser(id) {
  const { error } = await supabase.rpc('admin_delete_user', { target: id });
  if (error) throw error;
}

/**
 * Rol del usuario con sesión iniciada ('admin' | 'editor' | null)
 */
export async function getMyRole(userId) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  return data?.role || null;
}
