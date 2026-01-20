import { supabase } from '../lib/supabase';

/**
 * Obtiene todas las descripciones de secciones
 * @returns {Promise<Array>} Array con las descripciones
 */
export const getSectionDescriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('section_descriptions')
      .select('id, section_key, description')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching section descriptions:', error);
    return [];
  }
};

/**
 * Obtiene descripción por sección
 * @param {string} sectionKey - Clave de la sección
 * @returns {Promise<Object>} Descripción de la sección
 */
export const getSectionDescription = async (sectionKey) => {
  try {
    const { data, error } = await supabase
      .from('section_descriptions')
      .select('description')
      .eq('section_key', sectionKey)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.description || '';
  } catch (error) {
    console.error('Error fetching section description:', error);
    return '';
  }
};

/**
 * Crea o actualiza una descripción de sección
 * @param {string} sectionKey - Clave de la sección
 * @param {string} description - Descripción
 * @returns {Promise<Object>} Descripción creada/actualizada
 */
export const saveSectionDescription = async (sectionKey, description) => {
  try {
    const { data, error } = await supabase
      .from('section_descriptions')
      .upsert(
        [{ section_key: sectionKey, description }],
        { onConflict: 'section_key' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving section description:', error);
    throw error;
  }
};

/**
 * Elimina una descripción de sección
 * @param {number} id - ID de la descripción
 * @returns {Promise<void>}
 */
export const deleteSectionDescription = async (id) => {
  try {
    const { error } = await supabase
      .from('section_descriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting section description:', error);
    throw error;
  }
};
