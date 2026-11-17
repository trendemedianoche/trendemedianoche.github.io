-- Permite que el panel de admin (usuarios autenticados) escriba en el bucket
-- público donde viven las imágenes optimizadas de la galería.
--
-- Sin esto, al subir una foto el admin igual funciona: detecta que no puede
-- escribir en el bucket público y la guarda optimizada en el privado. La
-- diferencia es que el bucket público se sirve por CDN con caché de 1 año,
-- así que conviene aplicar estas políticas.
--
-- Cómo ejecutar: Supabase Dashboard -> SQL Editor -> pegar -> Run.

-- Lectura pública (el bucket ya es público, esto lo deja explícito)
drop policy if exists "galeria publica: lectura" on storage.objects;
create policy "galeria publica: lectura"
  on storage.objects for select
  to public
  using (bucket_id = 'trendemedianoche_public');

-- Subir imágenes nuevas
drop policy if exists "galeria publica: subir" on storage.objects;
create policy "galeria publica: subir"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'trendemedianoche_public');

-- Reemplazar una imagen existente
drop policy if exists "galeria publica: actualizar" on storage.objects;
create policy "galeria publica: actualizar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'trendemedianoche_public')
  with check (bucket_id = 'trendemedianoche_public');

-- Borrar desde el panel
drop policy if exists "galeria publica: borrar" on storage.objects;
create policy "galeria publica: borrar"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'trendemedianoche_public');

-- Verificar:
-- select policyname, cmd, roles from pg_policies
-- where schemaname = 'storage' and tablename = 'objects'
--   and policyname like 'galeria publica%';
