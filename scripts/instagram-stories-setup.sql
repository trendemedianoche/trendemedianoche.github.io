-- =====================================================
-- HISTORIAS DE INSTAGRAM
-- =====================================================
-- El importador (scripts/import-social.mjs) guarda aquí las
-- historias activas de la cuenta; el sitio muestra las de los
-- últimos días en la franja de la portada.
-- Ejecutar una vez en la consola SQL de Supabase.
-- =====================================================

CREATE TABLE IF NOT EXISTS instagram_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id TEXT NOT NULL UNIQUE,          -- id de la historia en Instagram
  media_type TEXT NOT NULL,                -- 'IMAGE' | 'VIDEO'
  media_url TEXT NOT NULL,                 -- copia en el bucket social_media
  thumbnail_url TEXT,                      -- portada (en videos)
  permalink TEXT,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instagram_stories_taken_at ON instagram_stories(taken_at DESC);

ALTER TABLE instagram_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Historias visibles para todos" ON instagram_stories;
CREATE POLICY "Historias visibles para todos"
ON instagram_stories FOR SELECT
USING (visible = true);

DROP POLICY IF EXISTS "Admin ve todas las historias" ON instagram_stories;
CREATE POLICY "Admin ve todas las historias"
ON instagram_stories FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin actualiza historias" ON instagram_stories;
CREATE POLICY "Admin actualiza historias"
ON instagram_stories FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admin elimina historias" ON instagram_stories;
CREATE POLICY "Admin elimina historias"
ON instagram_stories FOR DELETE
TO authenticated
USING (true);
