/**
 * Optimiza las imágenes de la galería alojadas en Supabase Storage.
 *
 * Qué hace:
 *   1. Lee las filas activas de `gallery_images`.
 *   2. Descarga el ORIGINAL de cada una (nunca una versión ya optimizada).
 *   3. Genera dos variantes WebP (lg 1920px / sm 800px), quitando EXIF.
 *   4. Las sube a un bucket PÚBLICO (URL estable y cacheable por el navegador).
 *   5. Repunta `gallery_images.bucket` + `.path` a la variante `lg`.
 *
 * Los originales NO se tocan: quedan intactos en el bucket privado.
 * La reversibilidad se guarda en un manifiesto (sin cambios de esquema).
 *
 * Uso:
 *   npm run optimize:gallery:dry       # simula, no escribe nada
 *   npm run optimize:gallery           # aplica
 *   npm run optimize:gallery:rollback  # vuelve a los originales
 */
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SRC_BUCKET = 'trendemedianoche_assets'; // privado, originales
const DST_BUCKET = 'trendemedianoche_public'; // público, derivados
const MANIFEST_REMOTE = 'optimized/_manifest.json';
const MANIFEST_LOCAL = path.join('scripts', 'gallery-manifest.json');

const VARIANTS = [
  { suffix: 'lg', max: 1920, quality: 72 },
  { suffix: 'sm', max: 800, quality: 70 }
];

const DRY = process.argv.includes('--dry-run');
const ROLLBACK = process.argv.includes('--rollback');
const FORCE = process.argv.includes('--force');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function readManifest() {
  const { data } = await db.storage.from(SRC_BUCKET).download(MANIFEST_REMOTE);
  if (data) {
    try {
      return JSON.parse(await data.text());
    } catch {
      /* manifiesto corrupto: se regenera */
    }
  }
  if (fs.existsSync(MANIFEST_LOCAL)) {
    return JSON.parse(fs.readFileSync(MANIFEST_LOCAL, 'utf8'));
  }
  return { version: 1, entries: {} };
}

async function writeManifest(m) {
  if (DRY) return;
  const body = JSON.stringify(m, null, 2);
  fs.writeFileSync(MANIFEST_LOCAL, body); // copia versionada de respaldo
  await db.storage
    .from(SRC_BUCKET)
    .upload(MANIFEST_REMOTE, Buffer.from(body), {
      upsert: true,
      contentType: 'application/json',
      cacheControl: '0'
    });
}

async function ensureBucket() {
  const { data } = await db.storage.getBucket(DST_BUCKET);
  if (data) return;
  if (DRY) {
    console.log(`(dry) crearía el bucket público ${DST_BUCKET}`);
    return;
  }
  const { error } = await db.storage.createBucket(DST_BUCKET, {
    public: true,
    allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png']
  });
  if (error && !/already exists/i.test(error.message)) throw error;
  console.log(`bucket público ${DST_BUCKET} listo`);
}

async function rollback() {
  const m = await readManifest();
  const entries = Object.entries(m.entries);
  if (!entries.length) {
    console.log('No hay nada que revertir (manifiesto vacío).');
    return;
  }
  for (const [id, e] of entries) {
    console.log(`restaurar #${id} -> ${e.originalBucket}/${e.originalPath}`);
    if (!DRY) {
      const { error } = await db
        .from('gallery_images')
        .update({ bucket: e.originalBucket, path: e.originalPath })
        .eq('id', Number(id));
      if (error) console.error(`  fallo:`, error.message);
    }
  }
  console.log('\nListo. Los derivados siguen en el bucket público (puedes borrarlos a mano).');
}

async function main() {
  if (ROLLBACK) return rollback();

  await ensureBucket();

  const { data: rows, error } = await db
    .from('gallery_images')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true });
  if (error) throw error;

  const manifest = await readManifest();
  let before = 0;
  let after = 0;

  for (const row of rows) {
    const prev = manifest.entries[row.id];

    // Si ya vive en el bucket público está optimizada: o la procesó este
    // script (queda en el manifiesto), o el panel de admin la convirtió a
    // WebP al subirla. En ninguno de los dos casos hay que volver a
    // comprimirla (recomprimir un WebP degrada la calidad).
    if (row.bucket === DST_BUCKET && !FORCE) {
      console.log(`skip  #${row.id}  ya optimizada`);
      continue;
    }

    // Siempre partir del ORIGINAL, nunca de un derivado
    const srcBucket = prev?.originalBucket ?? row.bucket ?? SRC_BUCKET;
    const srcPath = prev?.originalPath ?? row.path;

    const { data: blob, error: dlErr } = await db.storage
      .from(srcBucket)
      .download(srcPath);
    if (dlErr) {
      console.error(`FAIL  #${row.id} descarga: ${dlErr.message}`);
      continue;
    }

    const input = Buffer.from(await blob.arrayBuffer());
    before += input.length;
    console.log(`\n#${row.id}  ${srcPath}  (${kb(input.length)})`);

    // Nombre por contenido: re-ejecutar produce la misma clave (idempotente)
    const hash = crypto
      .createHash('sha256')
      .update(input)
      .update(JSON.stringify(VARIANTS))
      .digest('hex')
      .slice(0, 12);

    let primary = null;
    let failed = false;

    for (const v of VARIANTS) {
      const out = await sharp(input)
        .rotate() // aplica orientación EXIF y descarta el tag
        .resize({ width: v.max, height: v.max, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: v.quality, effort: 5 }) // sharp quita metadatos por defecto
        .toBuffer();

      const objKey = `gallery/${row.id}-${hash}-${v.suffix}.webp`;
      after += out.length;
      console.log(`  ${v.suffix}  ${kb(out.length).padStart(8)}  ${objKey}`);

      if (!DRY) {
        const { error: upErr } = await db.storage.from(DST_BUCKET).upload(objKey, out, {
          contentType: 'image/webp',
          cacheControl: '31536000', // seguro: la clave depende del contenido
          upsert: true
        });
        if (upErr) {
          console.error(`  FAIL subida: ${upErr.message}`);
          failed = true;
          break;
        }
      }
      if (v.suffix === 'lg') primary = objKey;
    }

    if (failed || !primary) continue;

    manifest.entries[row.id] = {
      originalBucket: srcBucket,
      originalPath: srcPath,
      newBucket: DST_BUCKET,
      newPath: primary,
      smPath: primary.replace(/-lg\.webp$/, '-sm.webp'),
      sourceBytes: input.length,
      hash,
      generatedAt: new Date().toISOString()
    };

    if (!DRY) {
      const { error: updErr } = await db
        .from('gallery_images')
        .update({ bucket: DST_BUCKET, path: primary })
        .eq('id', row.id);
      if (updErr) console.error(`  FAIL update BD: ${updErr.message}`);
    }
  }

  await writeManifest(manifest);
  console.log(
    `\n${DRY ? '(simulación) ' : ''}antes ${(before / 1048576).toFixed(2)} MB  ->  después ${(after / 1048576).toFixed(2)} MB`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
