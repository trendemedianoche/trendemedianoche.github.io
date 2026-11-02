import { supabase } from '../lib/supabase';

// Como en Instagram: el sitio muestra las historias de las últimas 24 horas
export const STORIES_HOURS = 24;

/**
 * Historias visibles de las últimas 24 horas (más antiguas primero, como en Instagram)
 */
export async function getRecentStories() {
  const since = new Date(Date.now() - STORIES_HOURS * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('instagram_stories')
    .select('*')
    .eq('visible', true)
    .gte('taken_at', since)
    .order('taken_at', { ascending: true });

  if (error) {
    console.error('❌ Error cargando historias:', error);
    return [];
  }
  return data || [];
}

/**
 * Todas las historias guardadas (admin)
 */
export async function getAllStories() {
  const { data, error } = await supabase
    .from('instagram_stories')
    .select('*')
    .order('taken_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando historias:', error);
    return [];
  }
  return data || [];
}

export async function setStoryVisible(id, visible) {
  const { error } = await supabase.from('instagram_stories').update({ visible }).eq('id', id);
  if (error) throw error;
}

export async function deleteStory(id) {
  const { error } = await supabase.from('instagram_stories').delete().eq('id', id);
  if (error) throw error;
}
