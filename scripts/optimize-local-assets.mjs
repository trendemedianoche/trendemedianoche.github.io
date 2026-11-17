/**
 * Convierte los assets locales (logos, respaldos, favicon) a WebP/PNG pequeños.
 *
 * Los logos se renderizan a 30-160 px pero se servían como PNG de ~200 KB.
 * Este script genera versiones del tamaño real de uso. Es re-ejecutable:
 * si vuelves a dejar un PNG grande en src/assets, córrelo de nuevo.
 *
 * Uso:  npm run optimize:assets
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const A = 'src/assets';
const P = 'public';

// Logos y marcas: llevan transparencia y se muestran con filtro invert.
const LOGOS = [
  { in: `${A}/logo-mark.png`, out: `${A}/logo-mark.webp`, width: 288 },
  { in: `${A}/logo-text.png`, out: `${A}/logo-text.webp`, width: 420 },
  { in: `${A}/logo_2.png`, out: `${A}/logo-full.webp`, width: 320 },
  { in: `${A}/logo.png`, out: `${A}/logo-admin.webp`, width: 256 },
  { in: `${A}/letters.png`, out: `${A}/letters.webp`, width: 400 }
];

// Fotos de respaldo (sólo se ven si Supabase no responde).
const PHOTOS = [
  { in: `${A}/band-bar-1.png`, out: `${A}/band-bar-1.webp`, width: 1600, quality: 70 },
  { in: `${A}/band-bar-2.png`, out: `${A}/band-bar-2.webp`, width: 1600, quality: 70 },
  { in: `${A}/band-tracks.png`, out: `${A}/band-tracks.webp`, width: 1600, quality: 70 },
  { in: `${A}/guitar.jpeg`, out: `${A}/guitar.webp`, width: 900, quality: 74 },
  { in: `${A}/harmonica.jpeg`, out: `${A}/harmonica.webp`, width: 900, quality: 74 },
  { in: `${A}/train-night.jpeg`, out: `${A}/train-night.webp`, width: 900, quality: 74 }
];

// Favicon / iconos: PNG (máxima compatibilidad), no WebP.
const ICONS = [
  { in: `${A}/logo-mark.png`, out: `${P}/favicon-32.png`, width: 32 },
  { in: `${A}/logo-mark.png`, out: `${P}/favicon-16.png`, width: 16 },
  { in: `${A}/logo-mark.png`, out: `${P}/apple-touch-icon.png`, width: 180 }
];

const kb = (f) => `${(fs.statSync(f).size / 1024).toFixed(0)} KB`;

async function run(job, encode) {
  if (!fs.existsSync(job.in)) {
    console.log(`skip  ${job.in} (no existe)`);
    return;
  }
  const beforeSize = fs.statSync(job.in).size;
  const pipeline = sharp(job.in).resize({ width: job.width, withoutEnlargement: true });
  await encode(pipeline, job).toFile(job.out);
  console.log(
    `${path.basename(job.in).padEnd(24)} ${(beforeSize / 1024).toFixed(0).padStart(6)} KB -> ${kb(job.out).padStart(8)}  ${path.basename(job.out)}`
  );
}

for (const j of LOGOS) {
  // effort alto + alphaQuality 100: los bordes duros del logo no se ensucian
  await run(j, (p) => p.webp({ quality: 90, alphaQuality: 100, effort: 6 }));
}
for (const j of PHOTOS) {
  await run(j, (p, job) => p.webp({ quality: job.quality ?? 74, effort: 5 }));
}
for (const j of ICONS) {
  await run(j, (p) => p.png({ compressionLevel: 9, palette: true }));
}

// og-image: lo consumen scrapers de redes -> PNG, tamaño declarado en index.html
await run(
  { in: `${A}/logo-mark.png`, out: `${P}/og-image.png`, width: 475 },
  (p) => p.flatten({ background: '#0a0a0a' }).png({ compressionLevel: 9 })
);

console.log('\nListo.');
