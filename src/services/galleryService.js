import { supabase } from '../lib/supabase';

export const GALLERY_BUCKET = 'trendemedianoche_assets';
const PUBLIC_BUCKET = 'trendemedianoche_public';

// Cada fila indica en qué bucket está su archivo: el público sirve URL directa,
// el privado necesita una URL firmada
export async function resolveImageUrl(img) {
  const bucket = img.bucket || GALLERY_BUCKET;
  if (bucket === PUBLIC_BUCKET) {
    return supabase.storage.from(bucket).getPublicUrl(img.path).data.publicUrl;
  }
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(img.path, 60 * 60); // 1 hora
  if (error) {
    console.error(`No se pudo firmar ${bucket}/${img.path}:`, error.message);
    return null;
  }
  return data.signedUrl;
}

export async function getGalleryImages() {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  const imagesWithUrls = await Promise.all(
    data.map(async (img) => {
      const url = await resolveImageUrl(img);
      return url ? { ...img, url } : null;
    })
  );

  return imagesWithUrls.filter(Boolean);
}
