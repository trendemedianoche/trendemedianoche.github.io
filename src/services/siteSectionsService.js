import { supabase } from '../lib/supabase';

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
