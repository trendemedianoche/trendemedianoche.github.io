// =====================================================
// Detección de fechas (tocatas) con Claude
// =====================================================
// Recibe el texto y/o la imagen de una publicación o historia
// y devuelve las presentaciones en vivo de la banda que
// anuncia o relata, con fecha, hora, lugar, etc.
// Requiere ANTHROPIC_API_KEY; sin ella el importador usa detect-events-free.mjs.
// =====================================================

import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

const EventSchema = z.object({
  title: z.string().describe('Nombre corto del evento, p. ej. "Sesiones USACH 2026" o "Tocata en La Puerta Amarilla"'),
  event_date: z.string().describe('Fecha en formato YYYY-MM-DD'),
  event_time: z.string().describe('Hora de inicio HH:MM en 24 h, o "" si no aparece'),
  venue: z.string().describe('Lugar (bar, teatro, universidad, festival), o ""'),
  city: z.string().describe('Comuna y/o ciudad, o ""'),
  address: z.string().describe('Dirección, o ""'),
  price: z.string().describe('Entrada tal como aparece ("$3.000", "Gratis"), o ""'),
  notes: z.string().describe('Dato breve útil (otras bandas, reservas), o ""'),
  certainty: z.enum(['alta', 'media', 'baja']).describe('Qué tan claro está que es una presentación de la banda en esa fecha')
});

const ResultSchema = z.object({
  events: z.array(EventSchema)
});

const SYSTEM = `Lees publicaciones e historias de Instagram/Facebook de "Tren de Medianoche", una banda chilena de blues, y extraes sus presentaciones en vivo: tocatas, shows, festivales, sesiones en vivo, eventos solidarios donde tocan.

- Incluye tanto las que se anuncian (próximas) como las que se relatan después de haber tocado ("gracias a todos los que vinieron anoche…"), deduciendo la fecha a partir de la fecha de publicación cuando el texto dice "este viernes", "anoche", "mañana", etc. Las fechas son de Chile.
- Si la imagen es un flyer, lee de ella la fecha, hora, lugar, dirección y entrada.
- No incluyas lanzamientos de canciones, grabaciones, ensayos ni eventos donde la banda no toca.
- Si no hay ninguna presentación con una fecha identificable, devuelve una lista vacía.
- Nunca inventes datos: deja "" lo que no aparezca.`;

let client = null;

export function eventsDetectionEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * @param {{ text?: string, imageUrl?: string, publishedAt: string, kind: string }} item
 * @returns {Promise<z.infer<typeof EventSchema>[]>}
 */
export async function detectEvents({ text, imageUrl, publishedAt, kind }) {
  client ??= new Anthropic();

  const published = new Date(publishedAt).toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const content = [];
  if (imageUrl) content.push({ type: 'image', source: { type: 'url', url: imageUrl } });
  content.push({
    type: 'text',
    text: `Tipo: ${kind}\nPublicado: ${published}\n\nTexto:\n${text?.trim() || '(sin texto, revisa la imagen)'}`
  });

  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: betaZodOutputFormat(ResultSchema) },
    system: SYSTEM,
    messages: [{ role: 'user', content }]
  });

  if (response.stop_reason === 'refusal' || !response.parsed_output) return [];

  return response.parsed_output.events.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.event_date));
}
