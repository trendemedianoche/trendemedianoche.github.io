import { supabase } from '../lib/supabase';

// ==========================
// GET (Home)
// ==========================
export async function getSiteSections() {
  const { data, error } = await supabase
    .from('site_sections')
    .select('key')
    .eq('active', true)
    .order('position');

  if (error) {
    console.error('Error loading site sections:', error);
    return [];
  }

  return data.map(s => s.key);
}

// ==========================
// ADMIN CRUD
// ==========================
export async function getAllSections() {
  const { data, error } = await supabase
    .from('site_sections')
    .select('*')
    .order('position');

  if (error) throw error;
  return data;
}

export async function createSection(section) {
  const { error } = await supabase
    .from('site_sections')
    .insert({
      key: section.key,
      active: section.active ?? true,
      position: section.position ?? 0
    });

  if (error) throw error;
}

export async function updateSection(id, updates) {
  const { error } = await supabase
    .from('site_sections')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteSection(id) {
  const { error } = await supabase
    .from('site_sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
