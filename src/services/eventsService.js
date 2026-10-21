import { supabase } from '../lib/supabase';

// Fecha local de hoy en formato YYYY-MM-DD (las fechas se guardan sin hora)
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Fechas publicadas: próximas (de la más cercana a la más lejana) y pasadas (de la más reciente)
 */
export async function getPublishedEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('❌ Error cargando fechas:', error);
    return { upcoming: [], past: [] };
  }

  const today = todayISO();
  return {
    upcoming: data.filter((e) => e.event_date >= today),
    past: data.filter((e) => e.event_date < today).reverse()
  };
}

/**
 * Todas las fechas (admin): primero las por revisar
 */
export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) {
    console.error('❌ Error cargando fechas:', error);
    return [];
  }
  return data || [];
}

export async function saveEvent(event) {
  const { id, ...fields } = event;
  const query = id
    ? supabase.from('events').update(fields).eq('id', id)
    : supabase.from('events').insert([{ source: 'manual', status: 'published', ...fields }]);
  const { error } = await query;
  if (error) throw error;
}

export async function setEventStatus(id, status) {
  const { error } = await supabase.from('events').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
