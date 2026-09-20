// Ajuste de compatibilidade do ícone do menu para navegadores móveis.
// O código-fonte permanece em index.html; o Netlify publica a cópia em dist/.
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styleEnd = '</style>';
if (source.split(styleEnd).length !== 2) {
  throw new Error('Esperava exatamente um bloco <style> em index.html. Build interrompido para evitar alterações incorretas.');
}
const fix = `
/* Menu visível em navegadores móveis: os traços do SVG precisam de stroke explícito. */
.menu-toggle svg { fill: none !important; stroke: currentColor !important; stroke-width: 2 !important; stroke-linecap: round !important; stroke-linejoin: round !important; }
.menu-toggle svg path { fill: none !important; stroke: currentColor !important; stroke-width: 2 !important; }
`;
const output = source.replace(styleEnd, fix + styleEnd);
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), output, 'utf8');
// Preserva arquivos estáticos que forem adicionados futuramente à raiz.
for (const name of fs.readdirSync(root)) {
  if (name.startsWith('.') || ['dist', 'index.html', 'build.cjs', 'netlify.toml', 'README.md', 'node_modules'].includes(name)) continue;
  const from = path.join(root, name);
  const to = path.join(dist, name);
  if (fs.statSync(from).isDirectory()) fs.cpSync(from, to, { recursive: true });
  else fs.copyFileSync(from, to);
}
console.log('Prévia Vorela gerada com correção do ícone do menu.');
