// =====================================================
// Importa publicaciones de Instagram y Facebook al blog
// =====================================================
// Lee las últimas publicaciones vía Graph API de Meta y crea
// entradas en blog_posts (como borrador por defecto).
// Las ya importadas se omiten (se compara source_id).
//
// Variables de entorno:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (obligatorias)
//   META_ACCESS_TOKEN                          (token de página, obligatorio)
//   IG_USER_ID                                 (opcional: activa Instagram)
//   FB_PAGE_ID                                 (opcional: activa Facebook)
//   SOCIAL_AUTO_PUBLISH=true                   (publica sin revisión)
//   SOCIAL_LIMIT=10                            (publicaciones por red)
//   SOCIAL_AUTHOR="Tren de Medianoche"
// =====================================================

import { createClient } from '@supabase/supabase-js';

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || 'v23.0'}`;
const BUCKET = 'social_media';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  META_ACCESS_TOKEN,
  IG_USER_ID,
  FB_PAGE_ID
} = process.env;
const AUTO_PUBLISH = process.env.SOCIAL_AUTO_PUBLISH === 'true';
const LIMIT = Number(process.env.SOCIAL_LIMIT || 10);
const AUTHOR = process.env.SOCIAL_AUTHOR || 'Tren de Medianoche';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !META_ACCESS_TOKEN) {
  console.error('❌ Faltan SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o META_ACCESS_TOKEN');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function graph(path, params) {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries({ ...params, access_token: META_ACCESS_TOKEN })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(`Graph API ${path}: ${body.error?.message || res.status}`);
  }
  return body;
}

/* ----------------------------- LECTURA ----------------------------- */

async function fetchInstagram() {
  const { data } = await graph(`${IG_USER_ID}/media`, {
    fields:
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}',
    limit: LIMIT
  });

  return data.map((m) => {
    const items = m.media_type === 'CAROUSEL_ALBUM' ? m.children?.data || [] : [m];
    return {
      source: 'instagram',
      source_id: `ig_${m.id}`,
      source_url: m.permalink,
      text: m.caption || '',
      created_at: m.timestamp,
      images: items.map((i) => (i.media_type === 'VIDEO' ? i.thumbnail_url : i.media_url)).filter(Boolean),
      hasVideo: items.some((i) => i.media_type === 'VIDEO')
    };
  });
}

async function fetchFacebook() {
  const { data } = await graph(`${FB_PAGE_ID}/posts`, {
    fields: 'id,message,created_time,permalink_url,full_picture,attachments{media_type,subattachments}',
    limit: LIMIT
  });

  return data
    .filter((p) => p.message || p.full_picture)
    .map((p) => {
      const attachment = p.attachments?.data?.[0];
      const subImages = (attachment?.subattachments?.data || [])
        .map((s) => s.media?.image?.src)
        .filter(Boolean);
      return {
        source: 'facebook',
        source_id: `fb_${p.id}`,
        source_url: p.permalink_url,
        text: p.message || '',
        created_at: p.created_time,
        images: subImages.length ? subImages : [p.full_picture].filter(Boolean),
        hasVideo: attachment?.media_type === 'video'
      };
    });
}

/* --------------------------- TRANSFORMACIÓN --------------------------- */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function makeTitle(item) {
  const firstLine = item.text
    .split('\n')
    .map((l) =>
      l
        .replace(/#\S+/g, '')
        .replace(/@([\w.]+)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .find(Boolean)
    // Se queda con la primera frase si es suficientemente larga
    ?.replace(/^(.{20,90}?[.!?…])\s.*$/, '$1');
  if (!firstLine) {
    const date = new Date(item.created_at).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return `Desde ${item.source === 'instagram' ? 'Instagram' : 'Facebook'} · ${date}`;
  }
  return firstLine.length > 90 ? `${firstLine.slice(0, 87).trimEnd()}…` : firstLine;
}

function makeContent(item, imageUrls) {
  // El texto va primero: la tarjeta del blog muestra los primeros 200 caracteres
  const paragraphs = item.text
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`);

  const images = imageUrls.map((url) => `<p><img src="${url}" alt="" loading="lazy" /></p>`);

  const network = item.source === 'instagram' ? 'Instagram' : 'Facebook';
  const linkLabel = item.hasVideo ? `Ver el video en ${network}` : `Ver publicación original en ${network}`;
  const link = `<p><a href="${item.source_url}" target="_blank" rel="noopener noreferrer">${linkLabel} →</a></p>`;

  return [...paragraphs, ...images, link].join('\n');
}

/* ----------------------------- IMÁGENES ----------------------------- */

// Las URLs del CDN de Meta caducan: se copian al bucket de Supabase
async function copyImage(url, path) {
  return copyMedia(url, path);
}

async function copyMedia(url, path, forcedExt = null) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url}: ${res.status}`);
  const contentType = res.headers.get('content-type') || (forcedExt === 'mp4' ? 'video/mp4' : 'image/jpeg');
  const ext = forcedExt || (contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg');
  const fullPath = `${path}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fullPath, Buffer.from(await res.arrayBuffer()), { contentType, upsert: true });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(fullPath).data.publicUrl;
}

/* ----------------------------- HISTORIAS ----------------------------- */

const STORIES_KEEP_DAYS = 30;

// Las historias duran 24 h en Instagram: se copian para mostrarlas en la franja de la portada
async function importStories() {
  const { data } = await graph(`${IG_USER_ID}/stories`, {
    fields: 'id,media_type,media_url,thumbnail_url,permalink,timestamp'
  });
  console.log(`🔍 Historias activas: ${data.length}`);
  if (!data.length) return;

  const { data: existing, error } = await supabase
    .from('instagram_stories')
    .select('source_id')
    .in('source_id', data.map((s) => s.id));
  if (error) throw error;
  const known = new Set(existing.map((e) => e.source_id));

  for (const story of data.filter((s) => !known.has(s.id) && s.media_url)) {
    const isVideo = story.media_type === 'VIDEO';
    const mediaUrl = await copyMedia(story.media_url, `stories/${story.id}`, isVideo ? 'mp4' : null);
    const thumbnailUrl = story.thumbnail_url ? await copyImage(story.thumbnail_url, `stories/${story.id}_thumb`) : null;

    const { error: insertError } = await supabase.from('instagram_stories').insert({
      source_id: story.id,
      media_type: story.media_type,
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl,
      permalink: story.permalink,
      taken_at: new Date(story.timestamp).toISOString()
    });
    if (insertError) throw insertError;
    console.log(`📸 Historia ${story.id} guardada (${story.media_type})`);
  }
}

// Borra las historias antiguas y sus archivos
async function cleanupStories() {
  const limit = new Date(Date.now() - STORIES_KEEP_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: old, error } = await supabase
    .from('instagram_stories')
    .select('id, media_url, thumbnail_url')
    .lt('taken_at', limit);
  if (error) throw error;
  if (!old.length) return;

  const marker = `/object/public/${BUCKET}/`;
  const paths = old
    .flatMap((s) => [s.media_url, s.thumbnail_url])
    .filter(Boolean)
    .map((url) => url.split(marker)[1])
    .filter(Boolean);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  await supabase.from('instagram_stories').delete().in('id', old.map((s) => s.id));
  console.log(`🧹 ${old.length} historias de más de ${STORIES_KEEP_DAYS} días eliminadas`);
}

/* ------------------------------ GALERÍA ------------------------------ */

const GALLERY_BUCKET = 'trendemedianoche_assets';

const hasText = (item) => item.text.replace(/#\S+/g, '').trim().length > 0;

// Agrega las imágenes a gallery_images ocultas (active=false) para decidir en Admin → Fotos
async function addToGallery(item) {
  const prefix = `images/social-${item.source_id}`;
  const { data: existing, error } = await supabase
    .from('gallery_images')
    .select('path')
    .like('path', `${prefix}%`);
  if (error) throw error;
  if (existing.length) return;

  const { data: last } = await supabase
    .from('gallery_images')
    .select('position')
    .order('position', { ascending: false })
    .limit(1);
  let position = last?.[0]?.position || 0;

  for (const [idx, url] of item.images.entries()) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo descargar ${url}: ${res.status}`);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const path = `${prefix}_${idx}.${contentType.includes('png') ? 'png' : 'jpg'}`;

    const { error: uploadError } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, Buffer.from(await res.arrayBuffer()), { contentType, upsert: true });
    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase
      .from('gallery_images')
      .insert({ path, position: ++position, active: false });
    if (insertError) throw insertError;
  }
  console.log(`🖼️  ${item.source_id} → galería (oculta, revisar en Admin → Fotos)`);
}

/* ------------------------------- MAIN ------------------------------- */

async function main() {
  const sources = [];
  if (IG_USER_ID) sources.push(['Instagram', fetchInstagram]);
  if (FB_PAGE_ID) sources.push(['Facebook', fetchFacebook]);
  if (!sources.length) {
    console.error('❌ Define IG_USER_ID y/o FB_PAGE_ID');
    process.exit(1);
  }

  if (IG_USER_ID) {
    try {
      await importStories();
      await cleanupStories();
    } catch (err) {
      console.error('❌ Error con las historias:', err.message);
      process.exitCode = 1;
    }
  }

  let items = [];
  for (const [name, fetcher] of sources) {
    try {
      const fetched = await fetcher();
      console.log(`🔍 ${name}: ${fetched.length} publicaciones leídas`);
      items = items.concat(fetched);
    } catch (err) {
      console.error(`❌ Error leyendo ${name}:`, err.message);
      process.exitCode = 1;
    }
  }
  if (!items.length) return;

  // Lo publicado en Instagram y en Facebook a la vez se importa solo una vez (desde Instagram):
  // mismo texto, o publicado con menos de 15 minutos de diferencia
  const normalize = (t) => t.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 120);
  const igItems = items.filter((i) => i.source === 'instagram');
  const igTexts = new Set(igItems.filter((i) => i.text).map((i) => normalize(i.text)));
  const igTimes = igItems.map((i) => new Date(i.created_at).getTime());
  items = items.filter((i) => {
    if (i.source !== 'facebook') return true;
    const time = new Date(i.created_at).getTime();
    const duplicated =
      (i.text && igTexts.has(normalize(i.text))) || igTimes.some((t) => Math.abs(t - time) < 15 * 60 * 1000);
    if (duplicated) console.log(`↩️  ${i.source_id} omitido: ya está en Instagram`);
    return !duplicated;
  });

  const { data: existing, error } = await supabase
    .from('blog_posts')
    .select('source_id')
    .in('source_id', items.map((i) => i.source_id));
  if (error) throw error;

  const known = new Set(existing.map((e) => e.source_id));

  // Sin texto (p. ej. un cambio de foto) no es una entrada del blog: va a la galería, oculta
  const imageOnly = items.filter((i) => !hasText(i));
  for (const item of imageOnly) {
    try {
      if (known.has(item.source_id)) {
        const { error: deleteError } = await supabase.from('blog_posts').delete().eq('source_id', item.source_id);
        if (deleteError) throw deleteError;
        console.log(`🧹 ${item.source_id} retirado del blog (solo imagen)`);
      }
      await addToGallery(item);
    } catch (err) {
      console.error(`❌ ${item.source_id}:`, err.message);
      process.exitCode = 1;
    }
  }

  const pending = items.filter((i) => hasText(i) && !known.has(i.source_id));
  console.log(`🆕 ${pending.length} publicaciones nuevas`);

  for (const item of pending) {
    try {
      const imageUrls = [];
      for (const [idx, url] of item.images.entries()) {
        imageUrls.push(await copyImage(url, `${item.source}/${item.source_id}_${idx}`));
      }

      const { error: insertError } = await supabase.from('blog_posts').insert({
        title: makeTitle(item),
        content: makeContent(item, imageUrls),
        author: AUTHOR,
        published: AUTO_PUBLISH,
        created_at: new Date(item.created_at).toISOString(),
        source: item.source,
        source_id: item.source_id,
        source_url: item.source_url,
        cover_image: imageUrls[0] || null
      });
      if (insertError) throw insertError;

      console.log(`✅ ${item.source_id} → "${makeTitle(item)}"`);
    } catch (err) {
      console.error(`❌ ${item.source_id}:`, err.message);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
