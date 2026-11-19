-- =====================================================
-- GESTIÓN DE USUARIOS DEL ADMIN
-- =====================================================
-- - Arregla las políticas de "profiles" (tenían recursión infinita).
-- - Crea un perfil para cada cuenta existente y para las futuras.
-- - Funciones seguras para que el admin liste las cuentas y cambie
--   nombre y rol. Solo responden a usuarios con rol 'admin'.
-- Ejecutar una vez en la consola SQL de Supabase.
-- =====================================================

-- Perfil por cuenta (id = auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'editor';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Perfiles para las cuentas que ya existen
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Y para cada cuenta nueva
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ¿El usuario actual es admin? (SECURITY DEFINER: no pasa por las políticas
-- de profiles, así se evita la recursión infinita)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Políticas de profiles: se reemplazan todas (las anteriores se llamaban a sí mismas)
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', p.policyname);
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada uno ve su perfil; los admin ven todos. Los cambios se hacen solo
-- con admin_update_user (así nadie puede darse el rol de admin a sí mismo).
CREATE POLICY "Ver el propio perfil o todos si es admin"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

-- Lista de cuentas registradas (solo admin)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  confirmed BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver los usuarios' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::TEXT, p.name, COALESCE(p.role, 'editor')::TEXT,
         u.created_at, u.last_sign_in_at, (u.email_confirmed_at IS NOT NULL)
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at;
END;
$$;

-- Cambiar nombre y rol de una cuenta (solo admin; nadie se quita su propio rol de admin)
CREATE OR REPLACE FUNCTION public.admin_update_user(target UUID, new_name TEXT, new_role TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden editar usuarios' USING ERRCODE = '42501';
  END IF;
  IF new_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Rol no válido: %', new_role;
  END IF;
  IF target = auth.uid() AND new_role <> 'admin' THEN
    RAISE EXCEPTION 'No puedes quitarte a ti mismo el rol de administrador';
  END IF;
  INSERT INTO public.profiles (id, name, role)
  VALUES (target, NULLIF(TRIM(new_name), ''), new_role)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_user(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, TEXT, TEXT) TO authenticated;

-- =====================================================
-- PRIMER ADMINISTRADOR
-- Reemplaza el correo por el que usas para entrar al admin.
-- (Para ver los correos registrados: SELECT email FROM auth.users;)
-- =====================================================
UPDATE public.profiles SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'TU_CORREO_DE_ADMIN@ejemplo.com');
