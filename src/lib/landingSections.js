// Secciones de la portada y sus textos por defecto.
// Lo mismo que siembra scripts/site-sections-texts.sql: si la tabla
// site_sections aún no tiene una sección (o un texto), se usa esto.
//
// En los títulos, lo que va entre *asteriscos* sale en cursiva ámbar
// y un salto de línea (Enter) parte el título en dos líneas.

export const LANDING_SECTIONS = [
  {
    key: 'hero',
    label: 'Portada (inicio)',
    fixed: true, // siempre primero y visible
    eyebrow: 'Est. 2017 · Blues chileno en español',
    title: 'Tren de\n*Medianoche*.',
    intro:
      'Composición original e improvisación. Blues electroacústico que conecta al ser humano con su entorno, su ciudad y *la vida cotidiana.*'
  },
  {
    key: 'lanzamiento',
    label: 'Último lanzamiento',
    eyebrow: '▶ Último lanzamiento',
    title: '',
    intro: '',
    hint: 'El título y la descripción salen de la canción del Reproductor.'
  },
  {
    key: 'historia',
    label: 'Historia',
    numbered: true,
    eyebrow: 'Historia',
    title: 'Blues que viaja\n*en español.*',
    intro: '',
    hint: 'El relato se edita en el módulo Historia.',
    extra: {
      stats: [
        { n: '2017', l: 'Fundación' },
        { n: '2', l: 'EPs' },
        { n: '10+', l: 'Singles' }
      ]
    }
  },
  {
    key: 'musica',
    label: 'Música',
    numbered: true,
    eyebrow: 'Discografía',
    title: 'Nuestro *recorrido.*',
    intro: ''
  },
  {
    key: 'banda',
    label: 'Banda',
    numbered: true,
    eyebrow: 'La banda',
    title: 'Tres músicos,\n*un mismo tren.*',
    intro:
      'Hemos contado con colaboraciones de César Díaz Bilbao, Marcelo Pizarro y Nehemías Muñoz, entre otros músicos de la escena nacional.'
  },
  {
    key: 'fechas',
    label: 'Fechas',
    numbered: true,
    eyebrow: 'Agenda',
    title: 'Próximas *fechas.*',
    intro:
      'Aún no hay fechas confirmadas publicadas aquí. Escríbenos para contrataciones.',
    hint: 'El texto se muestra cuando no hay fechas próximas.'
  },
  {
    key: 'blog',
    label: 'Blog',
    numbered: true,
    eyebrow: 'Bitácora',
    title: 'Notas desde *el vagón.*',
    intro: ''
  },
  {
    key: 'galeria',
    label: 'Galería',
    eyebrow: '▶ Galería',
    title: 'Del bar a las vías.',
    intro: 'Postales del tren mientras seguimos rodando por los escenarios.'
  },
  {
    key: 'noticias',
    label: 'Novedades',
    eyebrow: 'Novedades',
    title: 'Lo último del *tren.*',
    intro: '',
    hint: 'Solo aparece si hay fechas próximas o noticias de los últimos 6 meses.'
  },
  {
    key: 'apoyo',
    label: 'Apoyo / donaciones',
    eyebrow: 'Apóyanos',
    title: 'Apoya el *proyecto.*',
    intro:
      'Si quieres apoyar nuestro trabajo y futuras producciones, puedes hacerlo mediante transferencia bancaria.',
    hint: 'Solo aparece si hay datos de transferencia visibles.'
  },
  {
    key: 'contacto',
    label: 'Contacto',
    numbered: true,
    eyebrow: 'Contacto',
    title: '¿Nos *subimos* al tren?',
    intro:
      'Contratación de shows, prensa, colaboraciones y notas. Escríbenos y respondemos con la misma pasión con la que tocamos.'
  }
];

const DEFAULTS = Object.fromEntries(LANDING_SECTIONS.map((s) => [s.key, s]));

// Une las filas de site_sections con los valores por defecto.
// Devuelve { order: [claves visibles en orden], text: { clave: {...} } }.
// Sin la migración (scripts/site-sections-texts.sql) todo queda por defecto.
export function resolveSections(rows = []) {
  // Sin columnas de texto la tabla aún tiene las claves del sitio antiguo
  const migrated = rows.length > 0 && 'eyebrow' in rows[0];
  const known = migrated ? rows.filter((r) => DEFAULTS[r.key]) : [];

  const text = {};
  for (const def of LANDING_SECTIONS) {
    const row = known.find((r) => r.key === def.key) || {};
    text[def.key] = {
      ...def,
      eyebrow: row.eyebrow ?? def.eyebrow,
      title: row.title || def.title,
      intro: row.intro ?? def.intro,
      extra: { ...def.extra, ...(row.extra || {}) }
    };
  }

  const movable = LANDING_SECTIONS.filter((s) => !s.fixed);
  let order;
  if (known.length === 0) {
    order = movable.map((s) => s.key);
  } else {
    // Las que aún no están en la tabla van al final, visibles
    const pos = (key) => {
      const row = known.find((r) => r.key === key);
      return row ? (row.position ?? 0) : 1e6;
    };
    order = movable
      .filter((s) => known.find((r) => r.key === s.key)?.active !== false)
      .map((s) => s.key)
      .sort((a, b) => pos(a) - pos(b));
  }

  return { order, text };
}
