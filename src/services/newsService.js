import { supabase } from '../lib/supabase';

/* OBTENER */
export async function getNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  return data;
}

/* CREAR */
export async function createNews(news) {
  const { data, error } = await supabase
    .from('news')
    .insert([{ ...news, active: true }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ACTUALIZAR */
export async function updateNews(id, news) {
  const { data, error } = await supabase
    .from('news')
    .update(news)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ELIMINAR (soft delete recomendado) */
export async function deleteNews(id) {
  const { error } = await supabase
    .from('news')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
}
