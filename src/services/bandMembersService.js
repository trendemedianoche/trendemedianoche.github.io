import { supabase } from '../lib/supabase';

export async function getBandMembers() {
  const { data, error } = await supabase
    .from('band_members')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error cargando integrantes:', error);
    return [];
  }
  return data || [];
}

export async function getAllBandMembers() {
  const { data, error } = await supabase
    .from('band_members')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createBandMember(member) {
  const { error } = await supabase.from('band_members').insert([member]);
  if (error) throw error;
}

export async function updateBandMember(id, updates) {
  const { error } = await supabase.from('band_members').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteBandMember(id) {
  const { error } = await supabase.from('band_members').delete().eq('id', id);
  if (error) throw error;
}
