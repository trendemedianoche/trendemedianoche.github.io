import { supabase } from '../lib/supabase';

/**
 * Obtener comentarios de un post
 */
export async function getComments(postId) {
  console.log('🔍 Cargando comentarios del post:', postId);
  
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error cargando comentarios:', error);
    return [];
  }

  console.log('✅ Comentarios cargados:', data?.length || 0);
  return data || [];
}

/**
 * Obtener todos los comentarios (admin)
 */
export async function getAllComments() {
  console.log('🔍 Cargando todos los comentarios...');
  
  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      *,
      blog_posts (
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando comentarios:', error);
    return [];
  }

  console.log('✅ Comentarios cargados:', data?.length || 0);
  return data || [];
}

/**
 * Obtener comentarios pendientes de aprobación
 */
export async function getPendingComments() {
  console.log('🔍 Cargando comentarios pendientes...');
  
  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      *,
      blog_posts (
        title
      )
    `)
    .eq('approved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando comentarios pendientes:', error);
    return [];
  }

  console.log('✅ Comentarios pendientes:', data?.length || 0);
  return data || [];
}

/**
 * Crear un comentario
 */
export async function createComment(comment) {
  console.log('💾 Creando comentario...');
  
  const { data, error } = await supabase
    .from('blog_comments')
    .insert([{
      post_id: comment.post_id,
      author_name: comment.author_name,
      author_email: comment.author_email,
      content: comment.content,
      approved: false, // Por defecto no aprobado
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) {
    console.error('❌ Error creando comentario:', error);
    throw error;
  }

  console.log('✅ Comentario creado (pendiente de aprobación):', data);
  return data[0];
}

/**
 * Aprobar un comentario
 */
export async function approveComment(id) {
  console.log('✅ Aprobando comentario:', id);
  
  const { data, error } = await supabase
    .from('blog_comments')
    .update({ approved: true })
    .eq('id', id)
    .select();

  if (error) {
    console.error('❌ Error aprobando comentario:', error);
    throw error;
  }

  console.log('✅ Comentario aprobado:', data);
  return data[0];
}

/**
 * Rechazar/eliminar un comentario
 */
export async function deleteComment(id) {
  console.log('🗑️ Eliminando comentario:', id);
  
  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Error eliminando comentario:', error);
    throw error;
  }

  console.log('✅ Comentario eliminado');
}

/**
 * Contar comentarios de un post
 */
export async function getCommentsCount(postId) {
  console.log('🔍 Contando comentarios del post:', postId);
  
  const { count, error } = await supabase
    .from('blog_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('approved', true);

  if (error) {
    console.error('❌ Error contando comentarios:', error);
    return 0;
  }

  console.log('✅ Total de comentarios:', count);
  return count || 0;
}
