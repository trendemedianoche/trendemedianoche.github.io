-- =====================================================
-- SECCIONES DE LA PORTADA: ORDEN, VISIBILIDAD Y TEXTOS
-- =====================================================
-- Prepara site_sections para la portada nueva:
--   * agrega columnas de texto (etiqueta, título, texto y extras)
--   * reemplaza las claves del sitio antiguo (header, gallery, about,
--     music, news, footer, chat) por las secciones de la portada nueva
--   * siembra los textos que hoy muestra el sitio
--
-- Es idempotente: se puede ejecutar más de una vez y NO pisa los
-- textos que ya se hayan editado desde el admin.
-- Ejecuta TODO en el editor SQL de Supabase.
--
-- En los títulos: *texto* sale en cursiva ámbar y un salto de línea
-- parte el título en dos líneas.
-- Los mismos valores por defecto están en src/lib/landingSections.js
-- =====================================================

-- 1) Columnas de texto ------------------------------------------
ALTER TABLE site_sections ADD COLUMN IF NOT EXISTS eyebrow TEXT;
ALTER TABLE site_sections ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE site_sections ADD COLUMN IF NOT EXISTS intro TEXT;
ALTER TABLE site_sections ADD COLUMN IF NOT EXISTS extra JSONB DEFAULT '{}'::jsonb;
ALTER TABLE site_sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2) Claves del sitio antiguo (la portada nueva no las usa) ------
DELETE FROM site_sections
WHERE key IN ('header', 'gallery', 'about', 'music', 'news', 'footer', 'chat');

-- 'blog' existía en el sitio antiguo: se ubica tras Fechas solo la primera vez
UPDATE site_sections SET position = 6 WHERE key = 'blog' AND eyebrow IS NULL;

-- Si "id" no tiene valor automático (filas sembradas a mano), se le da uno,
-- para que el INSERT de abajo no falle con "null value in column id"
DO $$
DECLARE
  col RECORD;
BEGIN
  SELECT column_default, is_identity INTO col
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'site_sections' AND column_name = 'id';

  IF col.column_default IS NULL AND col.is_identity = 'NO' THEN
    CREATE SEQUENCE IF NOT EXISTS site_sections_id_seq OWNED BY site_sections.id;
    PERFORM setval('site_sections_id_seq', COALESCE((SELECT max(id) FROM site_sections), 0) + 1, false);
    ALTER TABLE site_sections ALTER COLUMN id SET DEFAULT nextval('site_sections_id_seq');
  END IF;
END $$;

-- Una fila por sección
CREATE UNIQUE INDEX IF NOT EXISTS site_sections_key_unique ON site_sections (key);

-- 3) Secciones de la portada nueva con sus textos actuales -------
INSERT INTO site_sections (key, active, position, eyebrow, title, intro, extra)
VALUES
  ('hero', true, 0,
    'Est. 2017 · Blues chileno en español',
    E'Tren de\n*Medianoche*.',
    'Composición original e improvisación. Blues electroacústico que conecta al ser humano con su entorno, su ciudad y *la vida cotidiana.*',
    '{}'),
  ('lanzamiento', true, 1, '▶ Último lanzamiento', NULL, NULL, '{}'),
  ('historia', true, 2,
    'Historia',
    E'Blues que viaja\n*en español.*',
    NULL,
    '{"stats": [{"n": "2017", "l": "Fundación"}, {"n": "2", "l": "EPs"}, {"n": "10+", "l": "Singles"}]}'),
  ('musica', true, 3, 'Discografía', 'Nuestro *recorrido.*', NULL, '{}'),
  ('banda', true, 4,
    'La banda',
    E'Tres músicos,\n*un mismo tren.*',
    'Hemos contado con colaboraciones de César Díaz Bilbao, Marcelo Pizarro y Nehemías Muñoz, entre otros músicos de la escena nacional.',
    '{}'),
  ('fechas', true, 5,
    'Agenda',
    'Próximas *fechas.*',
    'Aún no hay fechas confirmadas publicadas aquí. Escríbenos para contrataciones.',
    '{}'),
  ('blog', true, 6, 'Bitácora', 'Notas desde *el vagón.*', NULL, '{}'),
  ('galeria', true, 7,
    '▶ Galería',
    'Del bar a las vías.',
    'Postales del tren mientras seguimos rodando por los escenarios.',
    '{}'),
  ('noticias', true, 8, 'Novedades', 'Lo último del *tren.*', NULL, '{}'),
  ('apoyo', true, 9,
    'Apóyanos',
    'Apoya el *proyecto.*',
    'Si quieres apoyar nuestro trabajo y futuras producciones, puedes hacerlo mediante transferencia bancaria.',
    '{}'),
  ('contacto', true, 10,
    'Contacto',
    '¿Nos *subimos* al tren?',
    'Contratación de shows, prensa, colaboraciones y notas. Escríbenos y respondemos con la misma pasión con la que tocamos.',
    '{}')
ON CONFLICT (key) DO UPDATE SET
  -- Solo completa lo que esté vacío: no pisa lo editado en el admin
  eyebrow = COALESCE(site_sections.eyebrow, EXCLUDED.eyebrow),
  title   = COALESCE(site_sections.title, EXCLUDED.title),
  intro   = COALESCE(site_sections.intro, EXCLUDED.intro),
  extra   = CASE
              WHEN site_sections.extra IS NULL OR site_sections.extra = '{}'::jsonb
              THEN EXCLUDED.extra
              ELSE site_sections.extra
            END;

-- 4) Permisos (lectura pública, escritura solo admin autenticado) --
-- site_sections ya está en scripts/rls-setup.sql; se repite por si acaso.
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_site_sections" ON site_sections;
CREATE POLICY "public_select_site_sections" ON site_sections
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_site_sections" ON site_sections;
CREATE POLICY "auth_insert_site_sections" ON site_sections
  FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_site_sections" ON site_sections;
CREATE POLICY "auth_update_site_sections" ON site_sections
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_site_sections" ON site_sections;
CREATE POLICY "auth_delete_site_sections" ON site_sections
  FOR DELETE TO authenticated USING (true);

-- Que la API de Supabase vea las columnas nuevas de inmediato
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- SELECT key, active, position, eyebrow, title FROM site_sections ORDER BY position;
