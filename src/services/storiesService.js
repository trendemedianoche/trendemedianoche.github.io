import { supabase } from '../lib/supabase';

// Días hacia atrás que se muestran en la franja de la portada
export const STORIES_DAYS = 7;

/**
 * Historias visibles de los últimos días (más antiguas primero, como en Instagram)
 */
export async function getRecentStories() {
  const since = new Date(Date.now() - STORIES_DAYS * 24 * 60 * 60 * 1000).toISOString();
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
