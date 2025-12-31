import { supabase } from '../lib/supabase';

export async function getSiteSections() {
  const { data, error } = await supabase
    .from('site_sections')
    .select('id, key, active, position')
    .order('position');

  if (error) {
    console.error('Error loading site sections:', error);
    return [];
  }

  return data;
}

export async function createSiteSection(section) {
  const { error } = await supabase
    .from('site_sections')
    .insert({
      key: section.key,
      active: true,
      position: section.position
    });

  if (error) throw error;
}

export async function updateSiteSection(id, updates) {
  const { error } = await supabase
    .from('site_sections')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteSiteSection(id) {
  const { error } = await supabase
    .from('site_sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
