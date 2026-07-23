import { supabase } from '../lib/supabase';

export async function getAbout() {
  // Preferir la versión activa (puede haber versiones archivadas con active=false)
  let { data, error } = await supabase
    .from('about')
    .select('content')
    .eq('active', true)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fallback si la columna 'active' aún no existe
  if (error) {
    ({ data } = await supabase
      .from('about')
      .select('content')
      .limit(1)
      .maybeSingle());
  }

  return data?.content || '';
}

export async function updateAbout(content) {
  console.log('💾 Intentando guardar contenido...', { contentLength: content.length });
  
  // Editar siempre la versión ACTIVA (hay versiones archivadas con active=false)
  let { data: existing, error: selectError } = await supabase
    .from('about')
    .select('id')
    .eq('active', true)
    .limit(1);

  // Fallback si la columna 'active' aún no existe
  if (selectError) {
    ({ data: existing, error: selectError } = await supabase
      .from('about')
      .select('id')
      .limit(1));
  }

  if (selectError) {
    console.error('❌ Error checking about:', selectError);
    throw selectError;
  }

  console.log('📋 Registros existentes:', existing);

  if (existing && existing.length > 0) {
    // Si existe, actualizar
    console.log('🔄 Actualizando registro existente...');
    const { data, error } = await supabase
      .from('about')
      .update({ content })
      .eq('id', existing[0].id)
      .select();

    if (error) {
      console.error('❌ Error updating about:', error);
      throw error;
    }
    console.log(' Actualizado correctamente:', data);
  } else {
    // Si no existe, insertar
    console.log('➕ Insertando nuevo registro...');
    const { data, error } = await supabase
      .from('about')
      .insert({ content })
      .select();

    if (error) {
      console.error('❌ Error inserting about:', error);
      throw error;
    }
    console.log(' Insertado correctamente:', data);
  }

  return true;
}
