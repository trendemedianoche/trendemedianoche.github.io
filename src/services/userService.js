import { supabase } from '../lib/supabase';

export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateUserRole(id, role) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id);

  if (error) throw error;
}

export async function toggleUserActive(id, active) {
  const { error } = await supabase
    .from('profiles')
    .update({ active })
    .eq('id', id);

  if (error) throw error;
}
