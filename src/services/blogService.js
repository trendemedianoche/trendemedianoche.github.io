import { supabase } from '../lib/supabase';

/**
 * Obtener todos los posts del blog publicados
 */
export async function getBlogPosts() {
  console.log('🔍 Cargando posts del blog...');
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando posts:', error);
    return [];
  }

  console.log('✅ Posts cargados:', data?.length || 0);
  return data || [];
}

/**
 * Obtener todos los posts (admin)
 */
export async function getAllBlogPosts() {
  console.log('🔍 Cargando todos los posts...');
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando posts:', error);
    return [];
  }

  console.log('✅ Posts cargados:', data?.length || 0);
  return data || [];
}

/**
 * Obtener un post por ID
 */
export async function getBlogPost(id) {
  console.log('🔍 Cargando post:', id);
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ Error cargando post:', error);
    return null;
  }

  console.log('✅ Post cargado:', data);
  return data;
}

/**
 * Crear un nuevo post
 */
export async function createBlogPost(post) {
  console.log('💾 Creando nuevo post...');
  
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([{
      title: post.title,
      content: post.content,
      author: post.author,
      published: post.published || false,
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) {
    console.error('❌ Error creando post:', error);
    throw error;
  }

  console.log('✅ Post creado:', data);
  return data[0];
}

/**
 * Actualizar un post
 */
export async function updateBlogPost(id, updates) {
  console.log('💾 Actualizando post:', id);
  
  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('❌ Error actualizando post:', error);
    throw error;
  }

  console.log('✅ Post actualizado:', data);
  return data[0];
}

/**
 * Eliminar un post
 */
export async function deleteBlogPost(id) {
  console.log('🗑️ Eliminando post:', id);
  
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Error eliminando post:', error);
    throw error;
  }

  console.log('✅ Post eliminado');
}

/**
 * Publicar/despublicar un post
 */
export async function togglePublishPost(id, published) {
  console.log('🔄 Cambiando estado de publicación:', id, published);
  
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ published })
    .eq('id', id)
    .select();

  if (error) {
    console.error('❌ Error actualizando estado:', error);
    throw error;
  }

  console.log('✅ Estado actualizado:', data);
  return data[0];
}
