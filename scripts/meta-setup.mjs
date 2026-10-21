// =====================================================
// Asistente para conectar Instagram/Facebook con el blog
// =====================================================
// Convierte un token corto del Explorador de la Graph API en un
// token de página que no caduca, detecta los IDs de la página y
// de Instagram, y los guarda como secretos/variables en GitHub.
//
// Uso:  node scripts/meta-setup.mjs
// Requiere: gh (GitHub CLI) con sesión iniciada.
// =====================================================

import { execFileSync } from 'node:child_process';
import readline from 'node:readline';
import { Writable } from 'node:stream';

const GRAPH = 'https://graph.facebook.com/v23.0';

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    // En modo oculto no se muestra nada de lo que se escribe o pega
    const output = new Writable({
      write(chunk, _enc, cb) {
        if (!this.muted) process.stdout.write(chunk);
        cb();
      }
    });
    const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
    rl.question(hidden ? `${question}(no se mostrará al pegar) ` : question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('✔︎\n');
      resolve(answer.trim());
    });
    output.muted = hidden;
  });
}

async function graph(path, params) {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const body = await (await fetch(url)).json();
  if (body.error) throw new Error(body.error.message);
  return body;
}

const gh = (args, input) => execFileSync('gh', args, { input, stdio: ['pipe', 'inherit', 'inherit'] });

async function main() {
  console.log('\n🚂 Conectar Instagram/Facebook con el blog\n');
  console.log('Datos de tu app: developers.facebook.com → tu app → Configuración → Básica');
  const appId = await ask('App ID: ');
  const appSecret = await ask('App Secret: ', { hidden: true });
  if (!/^[0-9a-f]{32}$/i.test(appSecret)) {
    throw new Error(
      appSecret.startsWith('EAA')
        ? 'Eso es un token, no la App Secret. La App Secret son 32 letras/números en Configuración → Básica → "Clave secreta de la app".'
        : 'La App Secret debe tener 32 caracteres (letras a-f y números).'
    );
  }
  console.log('\nToken del Explorador de la Graph API (campo "Token de acceso", empieza con EAA)');
  const shortToken = await ask('Token: ', { hidden: true });

  const { access_token: longToken } = await graph('oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken
  });
  console.log('✅ Token de larga duración obtenido');

  const { data: pages } = await graph('me/accounts', {
    fields: 'id,name,access_token,instagram_business_account{id,username}',
    access_token: longToken
  });
  if (!pages.length) throw new Error('No se encontraron páginas. ¿Diste permiso a la página al generar el token?');

  pages.forEach((p, i) =>
    console.log(
      `  ${i + 1}. ${p.name}` +
        (p.instagram_business_account ? `  (Instagram: @${p.instagram_business_account.username})` : '  (sin Instagram vinculado)')
    )
  );
  const choice = pages.length === 1 ? 1 : Number(await ask('¿Cuál es la página de la banda? (número): '));
  const page = pages[choice - 1];
  if (!page) throw new Error('Opción no válida');

  const igId = page.instagram_business_account?.id;
  if (igId) {
    const { data } = await graph(`${igId}/media`, { fields: 'id,timestamp', limit: 1, access_token: page.access_token });
    console.log(`✅ Instagram responde (última publicación: ${data[0]?.timestamp || 'ninguna'})`);
  } else {
    console.log('⚠️  Esta página no tiene Instagram profesional vinculado: solo se importará Facebook.');
  }

  const includeFb = !igId || (await ask('¿Importar también los posts de Facebook? Si son los mismos que en Instagram, responde n (s/N): ')).toLowerCase() === 's';

  console.log('\n💾 Guardando en GitHub...');
  gh(['secret', 'set', 'META_ACCESS_TOKEN'], page.access_token);
  if (igId) gh(['variable', 'set', 'IG_USER_ID', '--body', igId]);
  if (includeFb) gh(['variable', 'set', 'FB_PAGE_ID', '--body', page.id]);

  const secrets = execFileSync('gh', ['secret', 'list'], { encoding: 'utf8' });
  if (!secrets.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('\nFalta la clave service_role de Supabase (Project Settings → API → service_role).');
    const serviceKey = await ask('service_role key (Enter para omitir): ', { hidden: true });
    if (serviceKey) gh(['secret', 'set', 'SUPABASE_SERVICE_ROLE_KEY'], serviceKey);
  }

  console.log('\n✅ Listo. Ya puedes ejecutar la Action "Importar Instagram y Facebook al blog".\n');
}

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
