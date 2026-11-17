-- Curar la lista "Canciones · escúchalas" (tabla top_tracks)
-- Deja ACTIVAS y ordenadas las 10 canciones seleccionadas (las de la imagen)
-- y desactiva (active = false) el resto.
--
-- Cómo ejecutar: Supabase Dashboard → SQL Editor → pega esto → Run.
-- Todo en una sola sentencia (atómica) para evitar choques de "position".

update top_tracks set
  active = (id in (11, 12, 15, 17, 19, 21, 22, 23, 24, 25)),
  position = case id
    when 25 then 1   -- Perro Callejero
    when 12 then 2   -- Cuatro Patitas
    when 24 then 3   -- Estación Central
    when 21 then 4   -- Santa se Llevó a Mi Chica
    when 15 then 5   -- Mi Padrino es un Bohemio
    when 23 then 6   -- Solo Debes Sonreír
    when 17 then 7   -- Única y Diferente
    when 19 then 8   -- Sr. Alcalde
    when 22 then 9   -- Mientras Mi Corazón
    when 11 then 10  -- Sientes Cómo
    -- Las desactivadas se mandan al final para no chocar posiciones
    when 13 then 101 -- Aullando a la Luna
    when 14 then 102 -- Carta a mis amigos
    when 16 then 103 -- Te Deseo lo Mejor
    when 18 then 104 -- Hombre Moderno
    when 20 then 105 -- En el Sexo y el Amor
    else position
  end,
  duration = case id
    when 25 then '03:28'
    when 12 then '03:28'
    when 24 then '05:05'
    when 21 then '04:34'
    when 15 then '04:20'
    when 23 then '03:28'
    when 17 then '04:51'
    when 19 then '04:45'
    when 22 then '04:07'
    when 11 then '04:31'
    else duration
  end
where id in (11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25);

-- Verificar el resultado:
-- select position, title, duration, active from top_tracks order by active desc, position;
