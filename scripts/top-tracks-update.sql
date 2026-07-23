-- =====================================================
-- CANCIONES CON LINKS DE SPOTIFY (para reproducir en la página)
-- =====================================================
-- Reemplaza el contenido de top_tracks por las canciones reales
-- con su enlace de Spotify. Ejecuta TODO en el editor SQL de
-- Supabase. Re-ejecutable.
-- =====================================================

DELETE FROM top_tracks;

INSERT INTO top_tracks (position, title, spotify_url, active) VALUES
  (1,  'Sientes Cómo',             'https://open.spotify.com/track/4GZ6PL2ci4VAUgGAlQ4qoo', true),
  (2,  'Cuatro Patitas',           'https://open.spotify.com/track/4QA7Mkxj0J5mrxP0TucWLi', true),
  (3,  'Aullando a la Luna',       'https://open.spotify.com/track/2dEHdtVGgsHsnKcTsHmQL1', true),
  (4,  'Carta a mis amigos',       'https://open.spotify.com/track/62N7jbaHx0KjNDIxsOIU5V', true),
  (5,  'Mi Padrino es un Bohemio', 'https://open.spotify.com/track/516eprAWRHXCBrhGvU2HfP', true),
  (6,  'Te Deseo lo Mejor',        'https://open.spotify.com/track/00WnNWHbjNTFZFZQwZrGs6', true),
  (7,  'Única y Diferente',        'https://open.spotify.com/track/0Yekd6VsaBjxY2ULIWVp3X', true),
  (8,  'Hombre Moderno',           'https://open.spotify.com/track/5SCzhtm3i71KHHI2HyOa1B', true),
  (9,  'Sr. Alcalde',              'https://open.spotify.com/track/1D7dMAp67I5rrDCui33BtI', true),
  (10, 'En el Sexo y el Amor',     'https://open.spotify.com/track/2PcX9bivUgL0oQ2eDs362c', true),
  (11, 'Santa se Llevó a Mi Chica','https://open.spotify.com/track/1tz6oSCTBYoqeVuFs7hdJz', true),
  (12, 'Mientras Mi Corazón',      'https://open.spotify.com/track/7vfArudfYZy6BRw2Pfb2PI', true),
  (13, 'Solo Debes Sonreír',       'https://open.spotify.com/track/15HMH07iGi67i0Hi9VmG1s', true),
  (14, 'Estación Central',         'https://open.spotify.com/track/4q2yNrNhky6lL37Rt3hgws', true),
  (15, 'Perro Callejero',          'https://open.spotify.com/track/4Ho4yzSaOg60OSsRE6Zo2W', true);

-- Verificación:
-- SELECT position, title, spotify_url FROM top_tracks ORDER BY position;
