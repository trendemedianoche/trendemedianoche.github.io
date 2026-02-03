-- =====================================================
-- SCRIPT DE BASE DE DATOS PARA EL SISTEMA DE BLOG
-- =====================================================
-- Este script crea las tablas necesarias para el blog
-- con sistema de comentarios y aprobación de moderación
-- =====================================================

-- Tabla de Posts del Blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Comentarios del Blog
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(approved);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at);

-- Trigger para actualizar updated_at automáticamente en blog_posts
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_posts_updated_at();

-- Trigger para actualizar updated_at automáticamente en blog_comments
CREATE OR REPLACE FUNCTION update_blog_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_comments_updated_at
BEFORE UPDATE ON blog_comments
FOR EACH ROW
EXECUTE FUNCTION update_blog_comments_updated_at();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para blog_posts
-- Cualquiera puede leer posts publicados
CREATE POLICY "Los posts publicados son visibles para todos"
ON blog_posts FOR SELECT
USING (published = true);

-- Solo usuarios autenticados pueden ver todos los posts (para admin)
CREATE POLICY "Usuarios autenticados pueden ver todos los posts"
ON blog_posts FOR SELECT
TO authenticated
USING (true);

-- Solo usuarios autenticados pueden crear posts
CREATE POLICY "Usuarios autenticados pueden crear posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar posts
CREATE POLICY "Usuarios autenticados pueden actualizar posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (true);

-- Solo usuarios autenticados pueden eliminar posts
CREATE POLICY "Usuarios autenticados pueden eliminar posts"
ON blog_posts FOR DELETE
TO authenticated
USING (true);

-- Políticas para blog_comments
-- Cualquiera puede leer comentarios aprobados
CREATE POLICY "Los comentarios aprobados son visibles para todos"
ON blog_comments FOR SELECT
USING (approved = true);

-- Usuarios autenticados pueden ver todos los comentarios (para admin)
CREATE POLICY "Usuarios autenticados pueden ver todos los comentarios"
ON blog_comments FOR SELECT
TO authenticated
USING (true);

-- Cualquiera puede crear comentarios (serán moderados)
CREATE POLICY "Cualquiera puede crear comentarios"
ON blog_comments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar comentarios
CREATE POLICY "Usuarios autenticados pueden actualizar comentarios"
ON blog_comments FOR UPDATE
TO authenticated
USING (true);

-- Solo usuarios autenticados pueden eliminar comentarios
CREATE POLICY "Usuarios autenticados pueden eliminar comentarios"
ON blog_comments FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Post de ejemplo
INSERT INTO blog_posts (title, content, author, published) VALUES
(
  'Bienvenidos al Blog',
  '<h2>¡Hola a todos!</h2><p>Este es el primer post de nuestro nuevo blog. Aquí compartiremos noticias, reflexiones y mucho más.</p><p>No olvides dejar tus comentarios. ¡Nos encantaría saber qué piensas!</p>',
  'Administrador',
  true
);

-- Comentario de ejemplo
-- Nota: Necesitarás reemplazar 'POST_ID_AQUI' con el ID real del post
-- INSERT INTO blog_comments (post_id, author_name, author_email, content, approved) VALUES
-- (
--   'POST_ID_AQUI',
--   'Usuario de Ejemplo',
--   'usuario@ejemplo.com',
--   '¡Excelente post! Me encanta el nuevo blog.',
--   true
-- );

-- =====================================================
-- CONSULTAS ÚTILES PARA ADMINISTRACIÓN
-- =====================================================

-- Ver todos los posts con conteo de comentarios
-- SELECT 
--   p.id,
--   p.title,
--   p.author,
--   p.published,
--   p.created_at,
--   COUNT(c.id) as total_comments,
--   COUNT(CASE WHEN c.approved = true THEN 1 END) as approved_comments
-- FROM blog_posts p
-- LEFT JOIN blog_comments c ON p.id = c.post_id
-- GROUP BY p.id, p.title, p.author, p.published, p.created_at
-- ORDER BY p.created_at DESC;

-- Ver comentarios pendientes de aprobación
-- SELECT 
--   c.*,
--   p.title as post_title
-- FROM blog_comments c
-- JOIN blog_posts p ON c.post_id = p.id
-- WHERE c.approved = false
-- ORDER BY c.created_at DESC;

-- =====================================================
-- NOTAS DE INSTALACIÓN
-- =====================================================
-- 1. Ejecuta este script en tu consola SQL de Supabase
-- 2. Verifica que las tablas se hayan creado correctamente
-- 3. Asegúrate de que las políticas RLS estén activas
-- 4. Opcionalmente, inserta el post de ejemplo
-- 5. Configura tu autenticación en Supabase si aún no lo has hecho
