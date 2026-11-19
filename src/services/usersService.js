import { supabase } from '../lib/supabase';

/**
 * Cuentas registradas (solo admin; ver scripts/users-admin-setup.sql)
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
