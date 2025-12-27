import { supabase } from '../lib/supabase';

export async function getAbout() {
  const { data, error } = await supabase
    .from('about')
    .select('content')
    .single();

  if (error) {
    console.error('Error loading about:', error);
    return '';
  }

  return data.content;
}
