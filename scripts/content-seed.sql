-- =====================================================
-- CARGA DE CONTENIDO DE LA MAQUETA + RESPALDO
-- =====================================================
-- Este script:
--   1) Crea la tabla content_backups y GUARDA una copia de
--      lo que hay hoy en `about` y `blog_posts` (respaldo).
--   2) Reemplaza el texto de `about` por la versión curada de
--      la maqueta (más corta y agradable).
--   3) Inserta entradas de blog bien redactadas (sin duplicar).
--
-- CÓMO ELEGIR EL CONTENIDO: edita los bloques $html$...$html$
-- de abajo antes de ejecutar. Puedes re-ejecutarlo cuando quieras
-- (cada corrida deja un nuevo respaldo con su fecha).
--
-- Ejecuta TODO el script en el editor SQL de Supabase (corre como
-- superusuario, así que ignora las políticas RLS).
-- =====================================================

-- 1) RESPALDO -----------------------------------------
CREATE TABLE IF NOT EXISTS content_backups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  row_data JSONB NOT NULL,
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Copia del estado actual (antes de reemplazar nada)
INSERT INTO content_backups (table_name, row_data)
SELECT 'about', to_jsonb(a) FROM about a;

INSERT INTO content_backups (table_name, row_data)
SELECT 'blog_posts', to_jsonb(b) FROM blog_posts b;

-- 2) ABOUT / HISTORIA (texto curado de la maqueta) ----
UPDATE about
SET content = $html$
<p>Tren de Medianoche surge en 2017 como un proyecto musical enfocado en la composición original y la improvisación, con una propuesta sonora basada principalmente en instrumentos electroacústicos.</p>
<p>En agosto de 2017 debutamos en vivo en un festival por el Día Internacional del Blues. Desde entonces hemos recorrido escenarios, festivales, eventos culturales y bares, consolidándonos como una banda emergente dentro del blues nacional.</p>
<p>Nuestras canciones exploran emociones, experiencias y relatos que conectan al ser humano con su entorno social y la vida cotidiana — desde una historia de adopción hasta una carta a los amigos que ya no están.</p>
$html$;

-- Si no existía ninguna fila en `about`, la creamos
INSERT INTO about (content)
SELECT $html$
<p>Tren de Medianoche surge en 2017 como un proyecto musical enfocado en la composición original y la improvisación, con una propuesta sonora basada principalmente en instrumentos electroacústicos.</p>
<p>En agosto de 2017 debutamos en vivo en un festival por el Día Internacional del Blues. Desde entonces hemos recorrido escenarios, festivales, eventos culturales y bares, consolidándonos como una banda emergente dentro del blues nacional.</p>
<p>Nuestras canciones exploran emociones, experiencias y relatos que conectan al ser humano con su entorno social y la vida cotidiana.</p>
$html$
WHERE NOT EXISTS (SELECT 1 FROM about);

-- 3) BLOG (entradas de la maqueta) --------------------
-- Se insertan solo si no existe ya un post con ese título.
INSERT INTO blog_posts (title, content, author, published)
SELECT * FROM (
  VALUES
    (
      'Sientes Cómo — nuestro último blues',
      $html$<p>“Sientes Cómo” es nuestro lanzamiento más reciente: un blues eléctrico que camina lento y pega hondo. Lo grabamos buscando ese punto donde la guitarra respira, la armónica llora y la voz termina contando más de lo que dice.</p><p>Es una canción sobre lo que se siente y no siempre se nombra: la nostalgia de una ciudad a medianoche, la certeza de que la música es el único idioma que no necesita traducción. La trabajamos durante meses hasta que sonó como queríamos: honesta, sin apuro, con el groove justo para que te quedes.</p><p>Escúchala en Spotify y míralo en YouTube. Y si te mueve algo, cuéntanos qué — para eso la escribimos.</p>$html$,
      'Tren de Medianoche',
      true
    ),
    (
      'Cuatro Patitas — una historia de adopción',
      $html$<p>“Cuatro Patitas” nació de una historia real: la de un perro que encontró casa y la de quienes, sin saberlo, encontraron compañía. Es una canción sobre las segundas oportunidades y sobre mirar el mundo desde abajo, con las orejas atentas y la cola lista para creer de nuevo.</p><p>Quisimos que la letra tuviera ternura sin caer en lo dulzón, y que el blues le pusiera el barro y la calle que la historia merecía. Cada vez que la tocamos en vivo, alguien se acerca al final a contarnos la suya. Esas conversaciones valen tanto como la canción.</p>$html$,
      'Tren de Medianoche',
      true
    ),
    (
      'Carta a mis amigos — en memoria de Héctor Briceño',
      $html$<p>Escribimos “Carta a mis amigos” en memoria de Héctor “Parquímetro” Briceño. Es una despedida y, a la vez, un agradecimiento: por el camino compartido, por las noches largas de música, por los amigos que ya no están pero que siguen sonando cada vez que afinamos.</p><p>Hay canciones que uno no elige escribir; llegan solas cuando falta alguien. Esta es una de esas. La grabamos con la banda casi en ronda, como si tocáramos para él. Va dedicada a todos los que alguna vez subieron a este tren y bajaron antes de tiempo.</p>$html$,
      'Tren de Medianoche',
      true
    ),
    (
      'Arriba de la Locomotora — así empezó todo',
      $html$<p>En 2018 grabamos nuestro primer EP, “Arriba de la Locomotora”, producido por Cristian Olivares. Fue el primer registro serio de lo que veníamos tocando en bares y festivales desde 2017: blues en español, con letras propias y ganas de contar la ciudad como la vemos.</p><p>Mirar atrás desde hoy es raro y lindo a la vez. Aquellas maquetas tenían la energía de lo que recién nace. Sin ese EP no habría vías, ni estaciones, ni este tren que sigue andando.</p>$html$,
      'Tren de Medianoche',
      true
    )
) AS nuevos(title, content, author, published)
WHERE NOT EXISTS (
  SELECT 1 FROM blog_posts bp WHERE bp.title = nuevos.title
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- SELECT id, title, published FROM blog_posts ORDER BY created_at DESC;
-- SELECT left(content, 120) FROM about;
-- SELECT table_name, backed_up_at FROM content_backups ORDER BY backed_up_at DESC;

-- =====================================================
-- RESTAURAR (si te arrepientes) — ejemplo para `about`:
-- =====================================================
-- UPDATE about a
-- SET content = b.row_data->>'content'
-- FROM (
--   SELECT row_data FROM content_backups
--   WHERE table_name = 'about'
--   ORDER BY backed_up_at DESC LIMIT 1
-- ) b
-- WHERE a.id = (b.row_data->>'id')::int;
