/**
 * Transformador de imágenes en el navegador.
 *
 * Convierte la foto que elige el usuario a WebP y la reduce de tamaño ANTES
 * de subirla, para que no viajen 7 MB de una cámara al storage. Genera dos
 * variantes con la convención que ya usa el sitio:
 *
 *   gallery/<nombre>-lg.webp   (1920 px) -> hero
 *   gallery/<nombre>-sm.webp   ( 800 px) -> miniaturas y carrusel
 *
 * Si el navegador no puede decodificar el archivo (por ejemplo un HEIC de
 * iPhone en un navegador que no lo soporta), devuelve `null` y quien llama
 * debe subir el original tal cual.
 */

export const VARIANTS = [
  { suffix: 'lg', max: 1920, quality: 0.82 },
  { suffix: 'sm', max: 800, quality: 0.8 }
];

/** ¿El navegador sabe escribir WebP en un canvas? */
export function supportsWebp() {
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Decodifica el archivo respetando la orientación EXIF.
 * Usa createImageBitmap (rápido, no bloquea) y cae a <img> si no está.
 */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Algunos navegadores no aceptan la opción: reintentar sin ella
      try {
        return await createImageBitmap(file);
      } catch {
        /* seguimos al fallback */
      }
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function targetSize(w, h, max) {
  if (w <= max && h <= max) return { w, h };
  const scale = Math.min(max / w, max / h);
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

function toBlob(canvas, type, quality) {
  if (canvas.convertToBlob) return canvas.convertToBlob({ type, quality }); // OffscreenCanvas
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Convierte un File a las variantes WebP definidas en VARIANTS.
 *
 * @param {File} file
 * @returns {Promise<null | { variants: Array<{suffix,blob,width,height}>, originalBytes:number, totalBytes:number }>}
 *          null si el navegador no puede procesarla (hay que subir el original).
 */
export async function toWebpVariants(file) {
  if (!file || !file.type?.startsWith('image/')) return null;
  if (!supportsWebp()) return null;

  let bitmap;
  try {
    bitmap = await decode(file);
  } catch {
    return null; // formato no soportado (HEIC, etc.)
  }

  const srcW = bitmap.width;
  const srcH = bitmap.height;
  if (!srcW || !srcH) return null;

  const variants = [];
  try {
    for (const v of VARIANTS) {
      const { w, h } = targetSize(srcW, srcH, v.max);
      const canvas = makeCanvas(w, h);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, w, h);

      const blob = await toBlob(canvas, 'image/webp', v.quality);
      if (!blob) return null;
      variants.push({ suffix: v.suffix, blob, width: w, height: h });
    }
  } finally {
    bitmap.close?.();
  }

  return {
    variants,
    originalBytes: file.size,
    totalBytes: variants.reduce((a, v) => a + v.blob.size, 0)
  };
}

/** Nombre base seguro para el storage, sin acentos ni espacios. */
export function slugifyFilename(name) {
  return (
    name
      .replace(/\.[^.]+$/, '') // quitar extensión
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '') // quitar tildes
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 40) || 'foto'
  );
}
