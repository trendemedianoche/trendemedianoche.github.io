import { supabase } from '../lib/supabase';

const BUCKET = 'trendemedianoche_assets';

// Canción activa para editar en el admin (sin URLs firmadas)
export async function getActiveSong() {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('Error cargando canción:', error);
    return null;
  }
  return data;
}

export async function updateSong(id, updates) {
  const { error } = await supabase.from('songs').update(updates).eq('id', id);
  if (error) throw error;
}

export async function getLatestSong() {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    // 🎵 audio
    const { data: audioSigned } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(data.storage_path, 3600);

    //  cover (opcional)
    let coverUrl = null;
    if (data.cover_path) {
      const { data: coverSigned } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(data.cover_path, 3600);

      coverUrl = coverSigned?.signedUrl || null;
    }

    return {
      ...data,
      audioUrl: audioSigned?.signedUrl || null,
      coverUrl
    };
  } catch (e) {
    console.error('Music load error:', e);
    return null;
  }
}
