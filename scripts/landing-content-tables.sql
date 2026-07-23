-- =====================================================
-- CONTENIDO EDITABLE DE LA LANDING
-- =====================================================
-- Crea las tablas para que la landing lea desde Supabase y
-- se edite desde el panel admin:
--   * songs        -> se añaden columnas spotify_url y youtube_url
--   * releases     -> discografía (línea de tiempo)
--   * top_tracks   -> top 10 escuchados
--   * band_members -> integrantes de la banda
--
-- Incluye RLS (lectura pública, escritura solo admin autenticado)
-- y siembra los datos de la maqueta. Idempotente.
-- Ejecuta TODO en el editor SQL de Supabase.
-- =====================================================

-- 1) SONGS: enlaces de streaming --------------------------------
ALTER TABLE songs ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS youtube_url TEXT;

UPDATE songs
SET spotify_url = COALESCE(spotify_url, 'https://open.spotify.com/intl-es/track/4GZ6PL2ci4VAUgGAlQ4qoo'),
    youtube_url = COALESCE(youtube_url, 'https://www.youtube.com/watch?v=P55OqqhOlTE')
WHERE title = 'Sientes Cómo';

-- 2) RELEASES (discografía) -------------------------------------
CREATE TABLE IF NOT EXISTS releases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  year TEXT,
  title TEXT NOT NULL,
  type TEXT,
  note TEXT,
  position INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO releases (year, title, type, note, position)
SELECT * FROM (VALUES
  ('2024','Sientes Cómo','Single','Último lanzamiento',1),
  ('2023','Cuatro Patitas','Single','Historia de adopción',2),
  ('2023','Carta a mis amigos','Single','En memoria de H. Briceño',3),
  ('2023','Aullando a la Luna','Single','Con César Díaz Bilbao en batería',4),
  ('2022','Mi padrino es un bohemio','Single','Primer adelanto del álbum debut',5),
  ('2021','Desde la Otra Ruta','EP','Producido por Johnny Espina',6),
  ('2021','Mi Mejor Regalo','Single','Con Nehemías Muñoz en saxofón',7),
  ('2018','Arriba de la Locomotora','EP','Producido por Cristian Olivares',8),
  ('2018','Santa se Llevó a Mi Chica','Single','Single navideño',9)
) AS v(year,title,type,note,position)
WHERE NOT EXISTS (SELECT 1 FROM releases);

-- 3) TOP_TRACKS (top 10) ----------------------------------------
CREATE TABLE IF NOT EXISTS top_tracks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  position INT DEFAULT 0,
  title TEXT NOT NULL,
  duration TEXT,
  spotify_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO top_tracks (position, title, duration)
SELECT * FROM (VALUES
  (1,'Perro Callejero','03:28'),
  (2,'Cuatro Patitas','03:28'),
  (3,'Estación Central','05:05'),
  (4,'Santa Se Llevó a Mi Chica','04:34'),
  (5,'Mi Padrino Es un Bohemio','04:20'),
  (6,'Solo Debes Sonreír','03:28'),
  (7,'Única y Diferente','04:51'),
  (8,'Sr. Alcalde','04:45'),
  (9,'Mientras Mi Corazón','04:07'),
  (10,'Sientes Cómo','04:31')
) AS v(position,title,duration)
WHERE NOT EXISTS (SELECT 1 FROM top_tracks);

-- 4) BAND_MEMBERS (integrantes) ---------------------------------
CREATE TABLE IF NOT EXISTS band_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  note TEXT,
  photo_url TEXT,
  position INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO band_members (name, role, note, position)
SELECT * FROM (VALUES
  ('Manuel Mercado','Guitarra & Voz','Compositor principal',1),
  ('Ricardo Mizraji','Armónica, Teclado & Coros','Hohner Marine Band',2),
  ('José Antil','Guitarra, Armónica & Coros','Slide & rítmica',3)
) AS v(name,role,note,position)
WHERE NOT EXISTS (SELECT 1 FROM band_members);

-- 5) RLS: lectura pública, escritura autenticada ----------------
DO $$
DECLARE
  t text;
  tbls text[] := ARRAY['releases','top_tracks','band_members'];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);

    EXECUTE format('DROP POLICY IF EXISTS "public_select_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "public_select_%1$s" ON %1$I FOR SELECT TO anon, authenticated USING (true);',
      t);

    EXECUTE format('DROP POLICY IF EXISTS "auth_insert_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "auth_insert_%1$s" ON %1$I FOR INSERT TO authenticated WITH CHECK (true);',
      t);

    EXECUTE format('DROP POLICY IF EXISTS "auth_update_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "auth_update_%1$s" ON %1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);',
      t);

    EXECUTE format('DROP POLICY IF EXISTS "auth_delete_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "auth_delete_%1$s" ON %1$I FOR DELETE TO authenticated USING (true);',
      t);
  END LOOP;
END $$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- SELECT count(*) FROM releases;
-- SELECT count(*) FROM top_tracks;
-- SELECT count(*) FROM band_members;
-- SELECT title, spotify_url, youtube_url FROM songs;
