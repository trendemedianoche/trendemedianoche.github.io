import { supabase } from '../lib/supabase';

export async function getNoticias() {
  const { data, error } = await supabase
    .from('entradas')
    .select('*')
    .order('creada_en', { ascending: false });

  if (error) throw error;
  return data;
}
