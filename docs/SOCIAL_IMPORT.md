# Importar Instagram y Facebook al blog

Cada 3 horas, la GitHub Action `.github/workflows/import-social.yml` corre `scripts/import-social.mjs`, que:

1. Lee las últimas publicaciones de Instagram y/o de la página de Facebook (Graph API de Meta).
2. Copia las imágenes al bucket `social_media` de Supabase (las URLs de Meta caducan).
3. Crea una entrada en `blog_posts` como **borrador**, con la fecha original, el texto, las imágenes y un enlace a la publicación.
4. Omite lo que ya importó antes (columna `source_id`), así que borrar o editar una entrada en el admin no la duplica.

Las revisas en **Admin → Blog**: llevan la etiqueta 📷 Instagram / 📘 Facebook. Edita el título si quieres y pulsa **Publicar**.

## Configuración (una sola vez)

### 1. Base de datos
Ejecuta `scripts/social-import-setup.sql` en el SQL Editor de Supabase.

### 2. Requisitos en Meta
- La cuenta de Instagram debe ser **profesional** (Creador o Empresa) y estar **vinculada a la página de Facebook** de la banda.
- Tú debes ser administrador de esa página.

### 3. Crear la app y obtener el token
1. En <https://developers.facebook.com/apps> crea una app de tipo **Empresa**.
2. Agrega los productos **Inicio de sesión con Facebook** e **Instagram Graph API**.
3. Abre el **Explorador de la Graph API**, elige tu app y pide estos permisos:
   `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `business_management`.
   Pulsa *Generate Access Token* (token de usuario de corta duración).
4. Conviértelo en token de larga duración:
   ```
   https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=TOKEN_CORTO
   ```
5. Con ese token largo, consulta tus páginas:
   ```
   https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=TOKEN_LARGO
   ```
   De la página de la banda anota:
   - `access_token` → **token de página** (no caduca mientras no cambies la contraseña ni quites permisos).
   - `id` → `FB_PAGE_ID`
   - `instagram_business_account.id` → `IG_USER_ID`

### 4. Secretos en GitHub
En el repo: **Settings → Secrets and variables → Actions**.

| Tipo | Nombre | Valor |
|---|---|---|
| Secret | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` |
| Secret | `META_ACCESS_TOKEN` | token de página del paso 3 |
| Variable | `IG_USER_ID` | id de Instagram (déjalo vacío para no importar Instagram) |
| Variable | `FB_PAGE_ID` | id de la página (déjalo vacío para no importar Facebook) |
| Variable | `SOCIAL_AUTO_PUBLISH` | `true` para publicar sin revisión (opcional) |

> Si en Facebook compartes lo mismo que en Instagram, configura solo `IG_USER_ID` para no tener entradas repetidas.

### 5. Probar
**Actions → Importar Instagram y Facebook al blog → Run workflow.** El log muestra qué se importó.

Para probarlo en local:
```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... META_ACCESS_TOKEN=... IG_USER_ID=... node scripts/import-social.mjs
```

## Problemas comunes
- **`Error validating access token`**: el token caducó o cambiaste la contraseña de Facebook. Repite el paso 3.
- **`(#10) Application does not have permission`**: falta algún permiso del paso 3, o la cuenta de Instagram no está vinculada a la página.
- **No aparecen imágenes**: revisa que el bucket `social_media` exista y sea público.

## Historias de Instagram

El mismo importador guarda las historias **activas** de la cuenta (las de las últimas 24 h; como corre cada 3 horas, alcanza a capturarlas todas) en la tabla `instagram_stories`, con la imagen o el video copiados al bucket `social_media`.

- Cuando hay historias de los últimos 7 días, el logo del menú lleva un anillo (ámbar si hay alguna sin ver, tenue si ya se vieron). Al tocarlo se abre un visor a pantalla completa.
- Si una historia comparte un post (se sube hasta 6 h después de él), tocar la imagen abre ese post en Instagram.
- En **Admin → Historias** puedes ocultar o eliminar cualquiera.
- Las de más de 30 días se borran solas (registro y archivos).
- Las historias de otras cuentas donde etiquetan a la banda no llegan por la API: hay que compartirlas en la historia propia.

Configuración: ejecutar `scripts/instagram-stories-setup.sql` una vez en Supabase.
