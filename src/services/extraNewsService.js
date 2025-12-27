import { supabase } from '../lib/supabase';

export async function getExtraNewsItems() {
  const { data, error } = await supabase
    .from('extra_news_items')
    .select('id, icon, content')
    .eq('active', true)
    .order('position');

  if (error) {
    console.error('Error loading extra news items:', error);
    return [];
  }

  return data;
}
