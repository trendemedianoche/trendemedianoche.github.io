import { supabase } from '../lib/supabase';

export async function getReleases() {
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error cargando discografía:', error);
    return [];
  }
  return data || [];
}

export async function getAllReleases() {
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createRelease(release) {
  const { error } = await supabase.from('releases').insert([release]);
  if (error) throw error;
}

export async function updateRelease(id, updates) {
  const { error } = await supabase.from('releases').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteRelease(id) {
  const { error } = await supabase.from('releases').delete().eq('id', id);
  if (error) throw error;
}
