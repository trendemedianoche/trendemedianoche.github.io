-- =====================================================
-- IMPORTACIÓN DESDE REDES SOCIALES (Instagram / Facebook)
-- =====================================================
-- Agrega a blog_posts los campos para saber de qué red
-- viene cada entrada y evitar importarla dos veces.
-- Ejecutar una vez en la consola SQL de Supabase.
-- =====================================================

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS source TEXT;        -- 'instagram' | 'facebook' | NULL (manual)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS source_id TEXT;     -- id de la publicación en Meta
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS source_url TEXT;    -- enlace a la publicación original
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;   -- imagen de portada para la tarjeta

CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_source_id ON blog_posts(source_id);

-- Bucket público para las imágenes copiadas desde Instagram/Facebook
-- (las URLs de Meta caducan, por eso se guardan en Supabase)
INSERT INTO storage.buckets (id, name, public)
VALUES ('social_media', 'social_media', true)
ON CONFLICT (id) DO NOTHING;
