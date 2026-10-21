-- =====================================================
-- AGENDA DE FECHAS (tocatas, presentaciones)
-- =====================================================
-- Las fechas se agregan a mano desde Admin → Agenda o las
-- detecta el importador con IA desde publicaciones e historias
-- (quedan "por revisar" hasta que se aprueban).
-- Ejecutar una vez en la consola SQL de Supabase.
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,                       -- '22:00'
  venue TEXT,                            -- 'Bar La Puerta Amarilla'
  city TEXT,                             -- 'La Reina, Santiago'
  address TEXT,
  price TEXT,                            -- 'Entrada $3.000', 'Gratis'
  notes TEXT,
  ticket_url TEXT,
  image_url TEXT,                        -- flyer
  source TEXT DEFAULT 'manual',          -- 'manual' | 'instagram' | 'facebook' | 'story'
  source_id TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Publicaciones/historias ya analizadas por la IA (para no analizarlas dos veces)
CREATE TABLE IF NOT EXISTS social_scans (
  source_id TEXT PRIMARY KEY,
  found INTEGER DEFAULT 0,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Fechas publicadas visibles para todos" ON events;
CREATE POLICY "Fechas publicadas visibles para todos"
ON events FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Admin gestiona fechas" ON events;
CREATE POLICY "Admin gestiona fechas"
ON events FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Primera fecha confirmada
INSERT INTO events (title, event_date, venue, source, status)
SELECT 'Teletón 2026', '2026-11-07', 'Teletón', 'manual', 'published'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE event_date = '2026-11-07');
