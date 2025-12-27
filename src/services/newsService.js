import { supabase } from '../lib/supabase';

export async function getNews() {
  const { data } = await supabase
  .from('news')
  .select('*')
  .eq('active', true)
  .order('id', { ascending: false });

  return data;
}