import { supabase } from '../lib/supabase';

const BUCKET = 'trendemedianoche_assets';

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
      const { data: signed, error: signError } =
        await supabase.storage
          .from(BUCKET)
          .createSignedUrl(img.path, 60 * 60); // 1 hora

      if (signError) {
        console.error(signError);
        return null;
      }

      return {
        ...img,
        url: signed.signedUrl
      };
    })
  );

  return imagesWithUrls.filter(Boolean);
}
