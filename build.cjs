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
/* Imagem real de referência na apresentação, no lugar do quadro conceitual. */
.intro-panel { display: block; position: relative; overflow: hidden; min-height: 0; padding: 0; margin: 0; background: #d9d0c2; }
.intro-panel img { display: block; width: 100%; height: auto; aspect-ratio: 1 / 1.02; object-fit: cover; object-position: center; }
.intro-panel figcaption { position: absolute; right: 12px; bottom: 12px; left: 12px; background: rgba(245,242,236,.96); padding: 11px 13px; color: #29342e; font: 11px/1.55 Arial,Helvetica,sans-serif; }
.intro-panel figcaption a { text-decoration: underline; text-underline-offset: 2px; }
`;
source = source.replace(styleEnd, menuFix + styleEnd);

// Substituição pontual: preservar todas as demais seções e links do site.
const oldPanel = '<div class="intro-panel" aria-hidden="true"><div class="intro-panel-inner"><span>Proporção.</span><span>Espaço.</span><span>Textura.</span><span>Detalhe.</span></div></div>';
if (source.split(oldPanel).length !== 2) {
  throw new Error('Quadro conceitual não localizado exatamente uma vez; publicação interrompida para evitar alterações indevidas.');
}
const newPanel = `<figure class="intro-panel">
<img src="https://commons.wikimedia.org/wiki/Special:FilePath/Modern_kitchen_and_dining_area_with_stylish_furnishings_and_natural_light_in_a_contemporary_home_setting.jpg?width=960" alt="Fotografia de referência de cozinha e sala de jantar integradas, com armários e luz natural" loading="lazy" decoding="async">
<figcaption>Inspiração de ambiente planejado, não projeto executado pela Vorela. Foto: <a href="https://commons.wikimedia.org/wiki/File:Modern_kitchen_and_dining_area_with_stylish_furnishings_and_natural_light_in_a_contemporary_home_setting.jpg" target="_blank" rel="noopener noreferrer">Shixart1985</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer">CC BY 2.0</a>.</figcaption>
</figure>`;
source = source.replace(oldPanel, newPanel);

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
console.log(`Vorela: fotografia da seção introdutória configurada; ${links} links de WhatsApp configurados; site estático gerado.`);
