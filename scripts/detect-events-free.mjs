// =====================================================
// Detección de fechas sin IA (gratuita)
// =====================================================
// Lee el texto de la publicación y, si hay imagen, el texto del
// flyer con OCR (tesseract.js). Luego busca con reglas en español
// fechas, hora, lugar, dirección y entrada. Solo devuelve algo si
// hay señales de que es una presentación en vivo.
// Las fechas detectadas quedan "por revisar" en el admin.
// =====================================================

import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import os from 'node:os';

const MONTHS = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8,
  septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
};
const WEEKDAYS = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };

const GIG_WORDS = [
  'tocata', 'tocamos', 'tocaremos', 'tocar en', 'en vivo', 'show', 'concierto', 'presentacion',
  'presentaremos', 'festival', 'escenario', 'entrada', 'invitados', 'los esperamos', 'nos vemos',
  'la cita', 'sesiones', 'gig', 'teleton', 'puertas abren', 'cover'
];
const RELEASE_WORDS = ['single', 'lanzamiento', 'estreno', 'disponible', 'plataformas', 'spotify', 'videoclip', 'grabado'];

const PLACES = [
  'Santiago', 'Providencia', 'Ñuñoa', 'La Reina', 'Las Condes', 'Vitacura', 'Macul', 'La Florida', 'Maipú',
  'Puente Alto', 'San Miguel', 'Estación Central', 'Recoleta', 'Independencia', 'Quinta Normal', 'Peñalolén',
  'La Cisterna', 'San Bernardo', 'Valparaíso', 'Viña del Mar', 'Concepción', 'Rancagua', 'Talca', 'La Serena',
  'Coquimbo', 'Temuco', 'Valdivia', 'Puerto Montt', 'Antofagasta', 'Iquique', 'Arica', 'Chillán', 'Quilpué',
  'Villa Alemana', 'San Antonio', 'Curicó', 'Los Andes', 'Melipilla', 'Talagante', 'Colina', 'Lampa'
];

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const pad = (n) => String(n).padStart(2, '0');
const DAY = 24 * 60 * 60 * 1000;

/* -------------------------------- OCR -------------------------------- */

let worker = null;

// Lee el flyer de varias formas: las tipografías de afiche se leen mejor ampliadas
// y por mitades. Devuelve un texto por variante.
async function ocr(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) return [];
  const original = Buffer.from(await res.arrayBuffer());
  const { width, height } = await sharp(original).metadata();
  const half = Math.round(width / 2);
  const variants = [
    original,
    await sharp(original).resize({ width: 2000 }).grayscale().normalize().png().toBuffer(),
    await sharp(original).extract({ left: 0, top: 0, width: half, height }).resize({ width: 1600 }).grayscale().normalize().png().toBuffer(),
    await sharp(original).extract({ left: half, top: 0, width: width - half, height }).resize({ width: 1600 }).grayscale().normalize().png().toBuffer()
  ];
  worker ??= await Tesseract.createWorker('spa', 1, { cachePath: os.tmpdir() });
  const texts = [];
  for (const img of variants) {
    const { data } = await worker.recognize(img);
    texts.push(data.text);
  }
  return texts;
}

// La fecha que más se repite entre las lecturas del flyer
function voteDate(texts, published) {
  const votes = new Map();
  const monthNames = Object.keys(MONTHS).join('|');
  // Una lectura limpia ("19 de Agosto", sin ruido entre día y mes) vale más
  const clean = new RegExp(`\\b(\\d{1,2})\\s*de[\\s|]*(${monthNames})\\b`, 'g');
  for (const t of texts) {
    for (const d of findDates(t, published, { relative: false })) votes.set(d, (votes.get(d) || 0) + 1);
    for (const m of strip(t).matchAll(clean)) {
      const date = withYear(MONTHS[m[2]], Number(m[1]), published);
      if (date) votes.set(toISO(date), (votes.get(toISO(date)) || 0) + 0.5);
    }
  }
  const [best] = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  return best ? { date: best[0], votes: best[1] } : null;
}

export async function closeOcr() {
  await worker?.terminate();
  worker = null;
}

/* ------------------------------- FECHAS ------------------------------- */

// Fecha de publicación en hora de Chile, como fecha local sin hora
function chileDate(iso) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(iso));
  const [y, m, d] = parts.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Sin año: el más cercano a la publicación, entre 4 meses antes y 10 meses después
function withYear(month, day, published) {
  const options = [-1, 0, 1]
    .map((dy) => new Date(published.getFullYear() + dy, month - 1, day))
    .filter((d) => d.getMonth() === month - 1 && d - published > -120 * DAY && d - published < 300 * DAY);
  options.sort((a, b) => Math.abs(a - published) - Math.abs(b - published));
  return options[0] || null;
}

function findDates(text, published, { relative = true } = {}) {
  const t = strip(text);
  const found = [];
  const monthNames = Object.keys(MONTHS).join('|');

  // "19 de agosto", "10 de abril de 2026" (el OCR puede meter ruido entre el día y el mes)
  const explicit = new RegExp(`\\b(\\d{1,2})\\s*(?:de\\s+)?[^\\d]{0,40}?\\b(${monthNames})\\b(?:\\s*(?:de|del)?\\s*(\\d{4}))?`, 'g');
  for (const m of t.matchAll(explicit)) {
    const day = Number(m[1]);
    const month = MONTHS[m[2]];
    if (day < 1 || day > 31) continue;
    const date = m[3] ? new Date(Number(m[3]), month - 1, day) : withYear(month, day, published);
    if (date && date.getDate() === day) found.push(date);
  }

  // "19/08", "19-08-2026"
  for (const m of t.matchAll(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/g)) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) continue;
    const year = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : null;
    const date = year ? new Date(year, month - 1, day) : withYear(month, day, published);
    if (date && date.getDate() === day) found.push(date);
  }

  // Relativas a la fecha de publicación
  if (relative && !found.length) {
    if (/\bpasado manana\b/.test(t)) found.push(new Date(published.getTime() + 2 * DAY));
    else if (/\bmanana\b/.test(t)) found.push(new Date(published.getTime() + DAY));
    else if (/\b(hoy|esta noche)\b/.test(t)) found.push(published);
    else if (/\banoche\b/.test(t)) found.push(new Date(published.getTime() - DAY));

    const weekdays = Object.keys(WEEKDAYS).join('|');
    const rel = new RegExp(`\\b(este|el|proximo|este proximo)\\s+(${weekdays})\\b(\\s+pasado)?`);
    const m = t.match(rel);
    if (m && !found.length) {
      const target = WEEKDAYS[m[2]];
      const diff = (target - published.getDay() + 7) % 7;
      found.push(new Date(published.getTime() + (m[3] ? diff - 7 : diff) * DAY));
    }
  }

  return [...new Set(found.map(toISO))].slice(0, 3);
}

/* ------------------------------- DATOS ------------------------------- */

function findTime(text) {
  const t = strip(text);
  // 2[0-3] va primero para que "20" no se lea como "2"
  const HOUR = '(2[0-3]|[01]?\\d)(?!\\d)';
  const m =
    t.match(new RegExp(`\\b${HOUR}[:.]([0-5]\\d)\\s*(?:h|hrs|horas|hs)?\\b`)) ||
    t.match(new RegExp(`\\b(?:a las|desde las|a contar de las)\\s+${HOUR}(?:[:.]([0-5]\\d))?`)) ||
    t.match(new RegExp(`\\b${HOUR}\\s*(?:hrs|horas|hs)\\b`));
  return m ? `${pad(m[1])}:${m[2] || '00'}` : '';
}

function findPrice(text) {
  const t = strip(text);
  if (/\b(entrada liberada|entrada gratuita|gratis|evento gratuito)\b/.test(t)) return 'Gratis';
  const m = t.match(/(?:entrada|valor|cover)[^$\n]{0,15}\$\s?(\d{1,3}(?:\.\d{3})+|\d{4,5})/) || t.match(/\$\s?(\d{1,3}\.\d{3}|\d{4,5})\b/);
  if (!m) return '';
  const n = Number(m[1].replace(/\./g, ''));
  return n >= 500 && n <= 100000 ? `$${n.toLocaleString('es-CL')}` : '';
}

const WORD = "[A-ZÁÉÍÓÚÑ0-9][\\wÁÉÍÓÚÑáéíóúñ'’-]*";
const CONNECTOR = '(?:\\s+(?:de|del|la|el|los|las|y))?';

function findVenue(text) {
  const kind = text.match(
    new RegExp(`\\b((?:Bar|Pub|Club|Teatro|Sala|Centro Cultural|Restobar|Café|Cafe|Galpón|Parque|Universidad)[ \\t]+${WORD}(?:${CONNECTOR}[ \\t]+${WORD}){0,4})`)
  );
  if (kind) return kind[1].trim();
  const en = text.match(new RegExp(`\\ben\\s+(?:(?:el|la|los|las)\\s+)?((?:(?:La|El|Los|Las)\\s+)?${WORD}(?:${CONNECTOR}\\s+${WORD}){0,4})`));
  if (en && !PLACES.some((p) => strip(p) === strip(en[1])) && !/^\\d/.test(en[1])) return en[1].trim();
  return '';
}

// En un flyer, una línea tipo "La Puerta Amarilla" (que no sea una comuna ni la banda)
function findFlyerVenue(texts) {
  for (const t of texts) {
    for (const line of t.split('\n')) {
      const m = line.match(/((?:La|El|Los|Las)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})\s*$/);
      if (m && !PLACES.some((p) => strip(p) === strip(m[1])) && !/medianoche/i.test(m[1])) return m[1];
    }
  }
  return '';
}

function findEventName(text) {
  const m = text.match(new RegExp(`\\b((?:Sesiones|Festival|Fiesta|Feria|Teletón|Encuentro|Ciclo)\\s+${WORD}(?:\\s+${WORD}){0,3})`));
  return m ? m[1].replace(/[^\w\sÁÉÍÓÚÑáéíóúñ'’-]+$/, '').trim() : '';
}

function findAddress(text) {
  const m = text.match(/\b((?:Av\.?|Avenida|Calle|Pasaje|Camino)\s+[^\n|,]{3,60}?\s*(?:#|N[°º]\s*)?\s*\d{2,5})/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function findCity(text) {
  const t = strip(text);
  return PLACES.find((p) => new RegExp(`\\b${strip(p)}\\b`).test(t)) || '';
}

/* ------------------------------- MAIN ------------------------------- */

/**
 * Misma forma de salida que detectEvents (Claude), para usarlas indistintamente.
 */
export async function detectEventsFree({ text = '', imageUrl, publishedAt }) {
  let flyerTexts = [];
  if (imageUrl) {
    try {
      flyerTexts = await ocr(imageUrl);
    } catch (err) {
      console.warn(`⚠️  OCR falló en ${imageUrl}: ${err.message}`);
    }
  }
  const flyer = flyerTexts.join('\n');
  const all = `${text}\n${flyer}`;
  const normalized = strip(all);

  const gig = GIG_WORDS.some((w) => normalized.includes(w));
  const release = RELEASE_WORDS.some((w) => normalized.includes(w));
  const published = chileDate(publishedAt);
  // La fecha escrita en el texto manda; si no hay, se vota entre las lecturas del flyer
  let dates = findDates(text, published);
  let flyerVotes = null;
  if (!dates.length && flyerTexts.length) {
    flyerVotes = voteDate(flyerTexts, published);
    if (flyerVotes) dates = [flyerVotes.date];
  }
  const time = findTime(all);
  // El lugar se busca primero en el texto escrito (el OCR trae ruido)
  const venue = findVenue(text) || findFlyerVenue(flyerTexts) || findVenue(flyer);
  const name = findEventName(text) || findEventName(flyer);

  // Hace falta una fecha y señales de tocata; un lanzamiento sin señales de show no cuenta
  if (!dates.length) return [];
  if (!gig && !(time && venue)) return [];
  if (release && !gig) return [];

  const title = name || (venue ? `Tocata en ${venue}` : 'Presentación en vivo');
  return dates.map((event_date) => ({
    title,
    event_date,
    event_time: time,
    venue: venue || name,
    city: findCity(all),
    address: findAddress(all),
    price: findPrice(all),
    notes: flyerVotes
      ? `Fecha leída del flyer: confírmala`
      : 'Detectada automáticamente: revisa los datos',
    certainty: venue && time && (!flyerVotes || flyerVotes.votes >= 1.5) ? 'media' : 'baja'
  }));
}
