import { supabase } from '../lib/supabase';

export async function getTopTracks() {
  const { data, error } = await supabase
    .from('top_tracks')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error cargando top tracks:', error);
    return [];
  }
  return data || [];
}

export async function getAllTopTracks() {
  const { data, error } = await supabase
    .from('top_tracks')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTopTrack(track) {
  const { error } = await supabase.from('top_tracks').insert([track]);
  if (error) throw error;
}

export async function updateTopTrack(id, updates) {
  const { error } = await supabase.from('top_tracks').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTopTrack(id) {
  const { error } = await supabase.from('top_tracks').delete().eq('id', id);
  if (error) throw error;
}
