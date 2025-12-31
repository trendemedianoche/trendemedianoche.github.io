import { supabase } from '../lib/supabase';

export async function getExtraNewsItems() {
  const { data, error } = await supabase
    .from('extra_news_items')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}


export async function createExtraNewsItem(news) {
  const { error } = await supabase
    .from('extra_news_items')
    .insert([news]);

  if (error) throw error;
}

export async function updateExtraNewsItem(id, news) {
  const { error } = await supabase
    .from('extra_news_items')
    .update(news)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteExtraNewsItem(id) {
  const { error } = await supabase
    .from('extra_news_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
