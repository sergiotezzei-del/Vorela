// Gera o site estático da Vorela sem serviços pagos ou dependências externas.
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
let source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const styleEnd = '</style>';
if (source.split(styleEnd).length !== 2) {
  throw new Error('Esperava exatamente um bloco <style> em index.html.');
}

const menuFix = `
/* Exibe corretamente os três traços do menu em navegadores móveis. */
.menu-toggle svg, .menu-toggle svg path { fill: none !important; stroke: currentColor !important; stroke-width: 2 !important; stroke-linecap: round !important; stroke-linejoin: round !important; }
`;
source = source.replace(styleEnd, menuFix + styleEnd);

// O número é o contato comercial informado e autorizado pelo responsável.
const whatsappUrl = 'https://wa.me/5516996444787?text=' + encodeURIComponent('Olá! Conheci a Vorela e gostaria de conversar sobre móveis planejados para meu ambiente.');
let links = 0;
source = source.replace(/<button\b([^>]*?)\bclass="([^"]*\bcontact\b[^"]*)"([^>]*)>([\s\S]*?)<\/button>/g, (_match, _before, classes, _after, label) => {
  links += 1;
  return `<a class="${classes}" href="${whatsappUrl}" rel="noopener noreferrer">${label}</a>`;
});
if (links < 2) throw new Error('Os botões de contato esperados não foram encontrados; publicação interrompida.');
const dialogHandler = "document.querySelectorAll('.contact').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));";
if (!source.includes(dialogHandler)) throw new Error('O manipulador antigo do WhatsApp mudou; publicação interrompida.');
source = source.replace(dialogHandler, '/* O contato agora abre o WhatsApp diretamente pelo link. */');
source = source.replace('<div class="preview">Prévia em desenvolvimento · Nome, imagens e contato em validação</div>', '');
source = source.replace('Ribeirão Preto e região · Prévia em validação', 'Ribeirão Preto e região');

const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), source, 'utf8');
for (const name of fs.readdirSync(root)) {
  if (name.startsWith('.') || ['dist', 'index.html', 'build.cjs', 'netlify.toml', 'README.md', 'node_modules'].includes(name)) continue;
  const from = path.join(root, name);
  const to = path.join(dist, name);
  if (fs.statSync(from).isDirectory()) fs.cpSync(from, to, { recursive: true });
  else fs.copyFileSync(from, to);
}
console.log(`Vorela: ${links} links de WhatsApp configurados; site estático gerado.`);
