'use strict';
// Instalação PWA da página comercial Vorela. Não altera autenticação nem rotas /sistema/.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = __dirname;
const dist = path.join(root, 'dist');
const page = path.join(dist, 'index.html');
let html = fs.readFileSync(page, 'utf8');
if (!html.includes('</head>') || !html.includes('</body>')) {
  throw new Error('HTML incompleto; interrompendo publicação da PWA.');
}
if (html.includes('rel="manifest"') || html.includes('serviceWorker.register')) {
  throw new Error('Manifesto/registro já existe: verificar antes de sobrescrever.');
}
const manifest = {
  id: '/',
  name: 'Vorela Ambientes Planejados',
  short_name: 'Vorela',
  description: 'Ambientes planejados em Ribeirão Preto e região.',
  lang: 'pt-BR',
  start_url: '/?source=pwa',
  scope: '/',
  display: 'standalone',
  background_color: '#f5f2ec',
  theme_color: '#29342e',
  prefer_related_applications: false,
  icons: [
    {src: '/icons/vorela-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
    {src: '/icons/vorela-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
    {src: '/icons/vorela-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}
  ]
};
fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
const iconsDir = path.join(dist, 'icons');
fs.mkdirSync(iconsDir, {recursive: true});
// Ícone próprio, V geométrico creme sobre verde escuro. PNG produzido com APIs nativas do Node.
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}
function crc32(data) {
  let c = 0xffffffff;
  for (const b of data) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([len, name, data, checksum]);
}
function lineDistance(x, y, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const projection = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(x - (ax + projection * vx), y - (ay + projection * vy));
}
function createIcon(size, fileName) {
  const rows = Buffer.alloc(size * (size * 4 + 1));
  const fg = [245, 242, 236], bg = [41, 52, 46];
  for (let y = 0; y < size; y++) {
    const offset = y * (size * 4 + 1);
    rows[offset] = 0;
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size, ny = (y + 0.5) / size;
      // O 'V' fica inteiramente na área central segura para máscaras circulares.
      const left = lineDistance(nx, ny, .315, .305, .5, .695);
      const right = lineDistance(nx, ny, .685, .305, .5, .695);
      const isV = Math.min(left, right) < .024 ||
        (ny > .28 && ny < .31 && ((nx > .275 && nx < .35) || (nx > .65 && nx < .725)));
      const color = isV ? fg : bg;
      const pos = offset + 1 + 4 * x;
      rows[pos] = color[0]; rows[pos + 1] = color[1]; rows[pos + 2] = color[2]; rows[pos + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(rows, {level: 9})),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.writeFileSync(path.join(iconsDir, fileName), png);
}
createIcon(192, 'vorela-192.png');
createIcon(512, 'vorela-512.png');
createIcon(512, 'vorela-maskable-512.png');
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#29342e"/><path d="M20 19 32 45 44 19" fill="none" stroke="#f5f2ec" stroke-width="3" stroke-linecap="square"/></svg>';
fs.writeFileSync(path.join(iconsDir, 'vorela.svg'), svg);
// Instalação somente do site público. Offline: página informativa, sem cache de /sistema/.
const offlinePage = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#29342e"><title>Vorela · Sem conexão</title><style>body{background:#f5f2ec;color:#29342e;font:16px/1.6 Arial,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;padding:24px}.box{max-width:480px}.logo{letter-spacing:.27em;font-size:24px}h1{font:normal 38px/1.1 Georgia,serif}a{color:#29342e}</style><main class="box"><div class="logo">VORELA</div><h1>Você está sem conexão.</h1><p>Conecte-se à internet e tente novamente. O atendimento pelo WhatsApp depende de conexão.</p><a href="/">Tentar novamente →</a></main></html>`;
fs.writeFileSync(path.join(dist, 'offline.html'), offlinePage);
const sw = `/* SW limitado à página comercial da Vorela; nenhuma informação privada é armazenada. */
'use strict';
const CACHE_NAME = 'vorela-public-offline-v1';
const OFFLINE_URL = '/offline.html';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add(OFFLINE_URL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('vorela-public-offline-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.mode !== 'navigate' || request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname !== '/') return;
  event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()));
});
`;
fs.writeFileSync(path.join(dist, 'sw.js'), sw);
const tags = `<link rel="manifest" href="/manifest.webmanifest">\n<link rel="icon" type="image/svg+xml" href="/icons/vorela.svg">\n<link rel="apple-touch-icon" href="/icons/vorela-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Vorela">`;
html = html.replace('</head>', tags + '\n</head>');
html = html.replace('</body>', `<script>\nif ('serviceWorker' in navigator && location.protocol === 'https:') {\n  window.addEventListener('load', () => {\n    navigator.serviceWorker.register('/sw.js', {scope: '/'}).catch(error => {\n      console.warn('Não foi possível ativar o modo offline da Vorela:', error);\n    });\n  });\n}\n</script>\n</body>`);
fs.writeFileSync(page, html);
console.log('Vorela: manifest, ícones PNG 192/512 e maskable, favicon, offline restrito e registro SW preparados.');