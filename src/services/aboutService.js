import { supabase } from '../lib/supabase';

export async function getAbout() {
  console.log('🔍 Intentando cargar contenido de About...');
  
  const { data, error } = await supabase
    .from('about')
    .select('content')
    .single();

  if (error) {
    console.error('❌ Error loading about:', error);
    return '';
  }

  console.log('✅ Contenido cargado:', data);
  return data.content || '';
}

export async function updateAbout(content) {
  console.log('💾 Intentando guardar contenido...', { contentLength: content.length });
  
  // Primero verificar si existe un registro
  const { data: existing, error: selectError } = await supabase
    .from('about')
    .select('id')
    .limit(1);

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
    console.log('✅ Actualizado correctamente:', data);
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
    console.log('✅ Insertado correctamente:', data);
  }

  return true;
}
