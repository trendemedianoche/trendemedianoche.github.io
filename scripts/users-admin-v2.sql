-- =====================================================
-- GESTIÓN DE USUARIOS (2): suspender, eliminar y confirmar correo
-- =====================================================
-- Requiere haber ejecutado antes scripts/users-admin-setup.sql.
-- Todas las funciones responden solo a administradores y nadie
-- puede suspenderse ni eliminarse a sí mismo.
-- Ejecutar una vez en la consola SQL de Supabase.
-- =====================================================

-- La lista ahora también indica si la cuenta está suspendida y su proveedor
DROP FUNCTION IF EXISTS public.admin_list_users();
CREATE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  confirmed BOOLEAN,
  suspended BOOLEAN,
  provider TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden ver los usuarios' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::TEXT, p.name, COALESCE(p.role, 'editor')::TEXT,
         u.created_at, u.last_sign_in_at, (u.email_confirmed_at IS NOT NULL),
         (u.banned_until IS NOT NULL AND u.banned_until > NOW()),
         COALESCE(u.raw_app_meta_data->>'provider', 'email')::TEXT
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at;
END;
$$;

-- Suspender (enabled = false) o reactivar (enabled = true) una cuenta.
-- Al suspender se cierran sus sesiones abiertas.
CREATE OR REPLACE FUNCTION public.admin_set_access(target UUID, enabled BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden suspender cuentas' USING ERRCODE = '42501';
  END IF;
  IF target = auth.uid() THEN
    RAISE EXCEPTION 'No puedes suspender tu propia cuenta';
  END IF;
  UPDATE auth.users
  SET banned_until = CASE WHEN enabled THEN NULL ELSE NOW() + INTERVAL '100 years' END
  WHERE id = target;
  IF NOT enabled THEN
    DELETE FROM auth.sessions WHERE user_id = target;
  END IF;
END;
$$;

-- Marcar el correo como confirmado (si el correo de confirmación no llegó)
CREATE OR REPLACE FUNCTION public.admin_confirm_email(target UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden confirmar correos' USING ERRCODE = '42501';
  END IF;
  UPDATE auth.users SET email_confirmed_at = NOW()
  WHERE id = target AND email_confirmed_at IS NULL;
END;
$$;

-- Eliminar una cuenta (su perfil se borra en cascada)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden eliminar cuentas' USING ERRCODE = '42501';
  END IF;
  IF target = auth.uid() THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta';
  END IF;
  DELETE FROM auth.users WHERE id = target;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_access(UUID, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_confirm_email(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_access(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
