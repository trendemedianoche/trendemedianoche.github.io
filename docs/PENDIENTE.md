# Pendiente: aviso de estado del importador en el admin

Resumen para retomar en otro PC (30-10-2026). Al abrir Claude Code en este repo, pídele: *"lee docs/PENDIENTE.md y continúa"*.

## Qué pasó
- Del 22 al 29 de octubre de 2026 la GitHub Action `import-social.yml` falló en todas sus ejecuciones porque Meta invalidó el token (*"The session has been invalidated because the user changed their password..."*). Nadie se dio cuenta durante una semana y se perdieron las historias de esos días (Instagram las borra a las 24 h).
- Ya está resuelto:
  - `META_ACCESS_TOKEN` ahora es un token de **usuario del sistema** (`importador-sitio`, commit `4bf02a9`), que no depende de la contraseña de nadie.
  - El cron pasó de cada 3 h a **cada hora** (GitHub se salta ejecuciones; en la práctica corría cada 4–9 h).
  - `actions/checkout` y `setup-node` pasaron a v5 (aviso de Node 20).
  - Ejecución manual del 30-10 validada: capturó la historia `18112078628179226`.
- Por revisar en **Admin → Blog**: un borrador importado de `instagram.com/p/DfHwbVhxU6_` (la historia del 30-10 lo comparte).

## Qué falta hacer
Que el admin avise cuando el importador lleva tiempo fallando.

1. **Tabla en Supabase** (nuevo `scripts/import-status-setup.sql`): una fila por fuente con
   `source` (`instagram_stories`, `instagram`, `facebook`) · `last_run_at` · `last_success_at` · `last_error` · `items_found`.
   RLS: lectura solo para usuarios autenticados (admin); escritura con la service role.
2. **`scripts/import-social.mjs`**: al final de cada bloque (historias, Instagram, Facebook) hacer `upsert` en esa tabla. En éxito, actualizar `last_success_at` y limpiar `last_error`; en error, guardar `err.message`. Que un fallo al escribir el estado no rompa la importación.
3. **Admin** (`src/admin/AdminPanel.jsx`): banner arriba del panel si `last_success_at` de alguna fuente tiene más de 24 h, con el error y un enlace a <https://github.com/trendemedianoche/trendemedianoche.github.io/actions/workflows/import-social.yml>. Si el error menciona el token, mostrar "Hay que renovar el token de Meta (ver docs/SOCIAL_IMPORT.md)".
4. Mostrar también "Última importación: hace X" en **Admin → Historias** (`StoriesAdmin.jsx`).
5. Documentar en `docs/SOCIAL_IMPORT.md`, ejecutar el SQL en Supabase, lanzar el workflow a mano (Actions → Run workflow) y comprobar que el banner aparece y desaparece.

## Útil saber
- Los logs de Actions solo se ven con sesión de GitHub: Actions → la ejecución → `import` → paso "Importar publicaciones".
- El estilo del admin está en `src/styles/admin.css`; los módulos siguen el patrón de `StoriesAdmin.jsx`.
