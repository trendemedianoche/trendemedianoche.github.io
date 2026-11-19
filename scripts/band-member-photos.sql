-- =====================================================
-- VARIAS FOTOS POR INTEGRANTE
-- =====================================================
-- photos: lista ordenada de URLs; la primera es la principal
-- (photo_url se mantiene igual a la primera, por compatibilidad).
-- Ejecutar una vez en la consola SQL de Supabase.
-- =====================================================

ALTER TABLE band_members ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Las fotos ya asignadas pasan a ser la primera de la lista
UPDATE band_members
SET photos = ARRAY[photo_url]
WHERE photo_url IS NOT NULL AND photo_url <> '' AND (photos IS NULL OR cardinality(photos) = 0);
