-- =====================================================
-- ACTUALIZAR EL ABOUT ACTIVO (versión intermedia enriquecida)
-- =====================================================
-- Deja el "about" con un poco más de contenido tomado del texto
-- antiguo (integrantes + hitos), sin llegar al muro completo.
-- Actualiza solo la versión activa. Ejecuta en el editor SQL de Supabase.
-- =====================================================

UPDATE about
SET content = $html$
<p>Tren de Medianoche surge en 2017 como un proyecto musical enfocado en la composición original y la improvisación, con una propuesta sonora basada principalmente en instrumentos electroacústicos. Sus canciones, escritas íntegramente en español, exploran emociones, experiencias y relatos que conectan al ser humano con su entorno social y la vida cotidiana.</p>
<p>En agosto de 2017 debutan en vivo junto a destacados músicos de la escena nacional, en un festival por el Día Internacional del Blues. Desde entonces han recorrido escenarios, festivales, eventos culturales y bares, consolidándose como una banda emergente del blues nacional e ingresando a distintas listas de reproducción del género.</p>
<p>Su recorrido incluye los EP “Arriba de la Locomotora” (2018) y “Desde la Otra Ruta” (2021), además de singles como “Mi Mejor Regalo”, “Mi padrino es un bohemio” y “Aullando a la Luna”. En 2023 estrenan “Cuatro Patitas” —una historia de adopción— y “Carta a mis amigos”, dedicada a la memoria de Héctor “Parquímetro” Briceño.</p>
$html$
WHERE active IS DISTINCT FROM false;

-- Si aún no corriste about-archive.sql (no existe la columna active),
-- usa en su lugar esta versión sin filtro:
-- UPDATE about SET content = $html$ ... $html$;
