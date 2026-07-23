-- =====================================================
-- ARCHIVAR EL ABOUT ANTIGUO (registro desactivado)
-- =====================================================
-- Añade a `about` las columnas `active` y `label`, deja la
-- versión actual como activa y guarda la biografía completa
-- anterior como un registro DESACTIVADO (active=false), para
-- poder reactivarla cuando quieras.
--
-- La web muestra solo la fila con active=true.
-- Ejecuta TODO en el editor SQL de Supabase. Idempotente.
-- =====================================================

ALTER TABLE about ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE about ADD COLUMN IF NOT EXISTS label TEXT;

-- La(s) fila(s) existentes = versión actual (activa)
UPDATE about
SET active = true,
    label = COALESCE(label, 'Versión actual')
WHERE active IS DISTINCT FROM false;

-- Guardar la biografía completa anterior como registro desactivado
INSERT INTO about (content, active, label)
SELECT $html$
<p>Tren de Medianoche surge en 2017 como un proyecto musical enfocado en la composición original y la improvisación, con una propuesta sonora basada principalmente en instrumentos electroacústicos. Sus canciones, escritas íntegramente en español, exploran emociones, experiencias y relatos que conectan al ser humano con su entorno social y la vida cotidiana.</p>
<p>La banda está integrada por Manuel Mercado (guitarra y voz), Ricardo Mizraji (armónica, teclado y coros) y José Antil (guitarra, armónica y coros).</p>
<p>En agosto de 2017 realizan su debut en vivo junto a destacados músicos de la escena nacional, participando en un festival en conmemoración del Día Internacional del Blues. Desde entonces, Tren de Medianoche ha recorrido diversos escenarios, festivales, eventos culturales y bares, consolidándose como una banda emergente dentro del blues nacional y logrando posicionarse tras el período de emergencia sanitaria, siendo incluida en distintas listas de reproducción del género.</p>
<p>Durante 2018 graban su primer EP “Arriba de la Locomotora” en Audiocustom Estudio bajo la producción de Cristian Olivares. Ese mismo año lanzan el single navideño “Santa se Llevó a Mi Chica”.</p>
<p>En 2021 publican su segundo EP “Desde la Otra Ruta”, producido por Johnny Espina, y el single “Mi Mejor Regalo”, grabado en Estudio Sol bajo la producción de Rodrigo Briceño, con la participación de Nehemías Muñoz en saxofón.</p>
<p>A fines de 2022 presentan “Mi padrino es un bohemio”, primer adelanto de su álbum debut. En abril de 2023 lanzan “Aullando a la Luna”, con la colaboración de César Díaz Bilbao en batería.</p>
<p>Durante la segunda mitad de 2023 estrenan “Cuatro Patitas”, una canción que relata la historia de adopción de una mascota y su visión del mundo junto a su dueño. Ese mismo año publican “Carta a mis amigos”, dedicada a la memoria de Héctor “Parquímetro” Briceño, con la colaboración de Marcelo Pizarro en batería.</p>
$html$, false, 'Biografía completa (archivada)'
WHERE NOT EXISTS (
  SELECT 1 FROM about WHERE active = false
);

-- =====================================================
-- VER / RESTAURAR
-- =====================================================
-- Ver versiones:
--   SELECT id, active, label, left(content,60) FROM about ORDER BY active DESC;
--
-- Para RESTAURAR la versión archivada (intercambia activo):
--   UPDATE about SET active = (label = 'Biografía completa (archivada)');
