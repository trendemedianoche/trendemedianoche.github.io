-- =====================================================
-- ROW LEVEL SECURITY (RLS) PARA TODAS LAS TABLAS DEL SITIO
-- =====================================================
-- El blog (blog_posts, blog_comments) ya está cubierto en
-- scripts/blog-database-setup.sql. Este script cubre las demás
-- tablas que usa el frontend. Las tablas que no existan se omiten
-- automáticamente (no falla el script).
--
-- REGLA GENERAL:
--   * SELECT (lectura): público (anon + authenticated) para el
--     contenido que muestra el sitio.
--   * INSERT / UPDATE / DELETE (escritura): SOLO usuarios
--     autenticados (el admin).
--
-- EXCEPCIONES:
--   * chat_messages: cualquiera puede INSERT (formulario de
--     contacto), pero solo el admin puede leer/editar/borrar,
--     porque contiene mensajes y correos de visitantes.
--
-- ⚠️  IMPORTANTE: al habilitar RLS sin políticas se bloquea TODO
-- el acceso. Ejecuta este script COMPLETO en el editor SQL de
-- Supabase para que el sitio siga funcionando y quede protegido.
-- Es idempotente: puedes re-ejecutarlo sin problemas.
-- =====================================================

-- Tablas de solo-contenido: lectura pública, escritura autenticada
DO $$
DECLARE
  t text;
  content_tables text[] := ARRAY[
    'about',
    'news',
    'extra_news_items',
    'gallery_images',
    'songs',
    'donation_methods',
    'donation_transfer_data',
    'site_sections',
    'social_networks'
  ];
BEGIN
  FOREACH t IN ARRAY content_tables LOOP
    -- Saltar tablas que no existan en la base
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      RAISE NOTICE 'Tabla % no existe, se omite.', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);

    -- Lectura pública
    EXECUTE format('DROP POLICY IF EXISTS "public_select_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "public_select_%1$s" ON %1$I FOR SELECT TO anon, authenticated USING (true);',
      t
    );

    -- Escritura solo autenticados
    EXECUTE format('DROP POLICY IF EXISTS "auth_insert_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "auth_insert_%1$s" ON %1$I FOR INSERT TO authenticated WITH CHECK (true);',
      t
    );

    EXECUTE format('DROP POLICY IF EXISTS "auth_update_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "auth_update_%1$s" ON %1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);',
      t
    );

    EXECUTE format('DROP POLICY IF EXISTS "auth_delete_%1$s" ON %1$I;', t);
    EXECUTE format(
      'CREATE POLICY "auth_delete_%1$s" ON %1$I FOR DELETE TO authenticated USING (true);',
      t
    );
  END LOOP;
END $$;

-- =====================================================
-- chat_messages: contacto público, lectura solo admin
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.chat_messages') IS NULL THEN
    RAISE NOTICE 'Tabla chat_messages no existe, se omite.';
    RETURN;
  END IF;

  ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "anyone_insert_chat_messages" ON chat_messages;
  CREATE POLICY "anyone_insert_chat_messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

  DROP POLICY IF EXISTS "auth_select_chat_messages" ON chat_messages;
  CREATE POLICY "auth_select_chat_messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

  DROP POLICY IF EXISTS "auth_update_chat_messages" ON chat_messages;
  CREATE POLICY "auth_update_chat_messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "auth_delete_chat_messages" ON chat_messages;
  CREATE POLICY "auth_delete_chat_messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (true);
END $$;

-- =====================================================
-- VERIFICACIÓN (ejecuta después para confirmar)
-- =====================================================
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' ORDER BY tablename;
--
-- SELECT tablename, policyname, cmd, roles FROM pg_policies
-- WHERE schemaname = 'public' ORDER BY tablename, cmd;
