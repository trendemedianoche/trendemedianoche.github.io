# Correos de acceso con la marca de la banda

Plantillas en español con el diseño del sitio para los correos que envía Supabase (cambio de contraseña, confirmación de cuenta, etc.). El logo se carga desde `https://trendemedianoche.github.io/email-logo.png` (archivo `public/email-logo.png`).

## 1. Pegar las plantillas

Supabase → **Authentication → Emails → Templates**. En cada pestaña, copia el **asunto** y reemplaza el cuerpo (**Source**) por el contenido completo del archivo:

| Pestaña en Supabase | Asunto | Archivo |
|---|---|---|
| Reset Password | `Elige una nueva contraseña · Tren de Medianoche` | `reset-password.html` |
| Confirm sign up | `Confirma tu acceso · Tren de Medianoche` | `confirm-signup.html` |
| Invite user | `Te invitaron al panel de Tren de Medianoche` | `invite.html` |
| Magic Link | `Tu enlace para entrar · Tren de Medianoche` | `magic-link.html` |
| Change Email Address | `Confirma tu nuevo correo · Tren de Medianoche` | `change-email.html` |

Pulsa **Save changes** en cada una. No cambies `{{ .ConfirmationURL }}`, `{{ .Email }}` ni `{{ .NewEmail }}`: Supabase los reemplaza por el enlace y los correos reales.

## 2. Remitente "Tren de Medianoche" (opcional)

Sin esto, los correos llegan desde `Supabase Auth <noreply@mail.app.supabase.io>`. Para que lleguen como **Tren de Medianoche** desde el correo de la banda hay que usar un servidor de correo propio (SMTP). Con Gmail:

1. En la cuenta de Gmail de la banda, activa la **verificación en dos pasos** (myaccount.google.com → Seguridad).
2. Crea una **contraseña de aplicación** en myaccount.google.com/apppasswords (nombre: "Supabase"). Copia los 16 caracteres.
3. Supabase → **Authentication → Emails → SMTP Settings** → **Enable custom SMTP**:
   - Sender email: el Gmail de la banda
   - Sender name: `Tren de Medianoche`
   - Host: `smtp.gmail.com`
   - Port: `465`
   - Username: el Gmail de la banda
   - Password: la contraseña de aplicación del paso 2
4. **Save** y prueba con "¿Olvidaste tu contraseña?" en el login.

Ventaja extra: el correo integrado de Supabase permite muy pocos envíos por hora; con SMTP propio ese límite lo pone Gmail (unos 500 al día).
