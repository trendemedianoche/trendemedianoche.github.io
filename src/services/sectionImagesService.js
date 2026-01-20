import { supabase } from '../lib/supabase';

/**
 * Obtiene todas las imágenes divisoras de secciones
 * @returns {Promise<Array>} Array con las imágenes divisoras
 */
export const getSectionDividers = async () => {
  try {
    const { data, error } = await supabase
      .from('section_dividers')
      .select('id, section_key, image_url, caption, position')
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching section dividers:', error);
    return [];
  }
};

/**
 * Crea o actualiza una imagen divisora de sección
 * @param {Object} divider - Objeto con los datos del divisor
 * @param {string} divider.section_key - Clave de la sección
 * @param {string} divider.image_url - URL de la imagen
 * @param {string} divider.caption - Caption de la imagen
 * @param {number} divider.position - Posición en el orden
 * @returns {Promise<Object>} Divisor creado/actualizado
 */
export const saveSectionDivider = async (divider) => {
  try {
    const { data, error } = await supabase
      .from('section_dividers')
      .upsert([divider], { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving section divider:', error);
    throw error;
  }
};

/**
 * Elimina una imagen divisora
 * @param {number} id - ID del divisor
 * @returns {Promise<void>}
 */
export const deleteSectionDivider = async (id) => {
  try {
    const { error } = await supabase
      .from('section_dividers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting section divider:', error);
    throw error;
  }
};

/**
 * Obtiene divisor por sección
 * @param {string} sectionKey - Clave de la sección
 * @returns {Promise<Object>} Divisor de la sección
 */
export const getSectionDividerByKey = async (sectionKey) => {
  try {
    const { data, error } = await supabase
      .from('section_dividers')
      .select('*')
      .eq('section_key', sectionKey)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching section divider by key:', error);
    return null;
  }
};
