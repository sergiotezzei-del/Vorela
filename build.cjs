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
/* Imagem de referência na apresentação, no lugar do quadro conceitual. */
.intro-panel { display: block; position: relative; overflow: hidden; min-height: 0; padding: 0; margin: 0; background: #d9d0c2; }
.intro-panel img { display: block; width: 100%; height: auto; aspect-ratio: 1 / 1.02; object-fit: cover; object-position: center; }
.intro-panel figcaption { position: absolute; right: 12px; bottom: 12px; left: 12px; background: rgba(245,242,236,.96); padding: 11px 13px; color: #29342e; font: 11px/1.55 Arial,Helvetica,sans-serif; }
`;
source = source.replace(styleEnd, menuFix + styleEnd);

// Fotos de referência do Pexels: licença gratuita para uso comercial, sem crédito público obrigatório.
// Registro interno: https://www.pexels.com/photo/wooden-cabinets-in-the-modern-kitchen-8143944/
// Registro interno: https://www.pexels.com/photo/interior-of-modern-kitchen-with-wooden-furniture-7031617/
// Substituir ambas por imagens próprias autorizadas assim que estiverem disponíveis.
const originalHero = 'https://commons.wikimedia.org/wiki/Special:FilePath/Modern_kitchen_design_featuring_minimalistic_elements%2C_warm_lighting%2C_and_high-end_appliances_in_a_contemporary_setting.jpg?width=1600';
const newHero = 'https://images.pexels.com/photos/8143944/pexels-photo-8143944.jpeg?auto=compress&cs=tinysrgb&w=1600';
if (source.split(originalHero).length !== 2) {
  throw new Error('Imagem anterior do topo não localizada exatamente uma vez; publicação interrompida.');
}
source = source.replace(originalHero, newHero);
const oldCredit = 'Fotografia de <a href="https://commons.wikimedia.org/wiki/File:Modern_kitchen_design_featuring_minimalistic_elements,_warm_lighting,_and_high-end_appliances_in_a_contemporary_setting.jpg" target="_blank" rel="noopener noreferrer">Nenad Stojković</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer">CC BY 2.0</a>. Foto utilizada como referência, não como obra da Vorela.';
if (source.split(oldCredit).length !== 2) {
  throw new Error('Crédito da imagem anterior do topo não localizado exatamente uma vez; publicação interrompida.');
}
source = source.replace(oldCredit, 'Imagens ilustrativas de referência. Não são projetos executados pela Vorela.');

// Substituição pontual: preservar todas as demais seções e links do site.
const oldPanel = '<div class="intro-panel" aria-hidden="true"><div class="intro-panel-inner"><span>Proporção.</span><span>Espaço.</span><span>Textura.</span><span>Detalhe.</span></div></div>';
if (source.split(oldPanel).length !== 2) {
  throw new Error('Quadro conceitual não localizado exatamente uma vez; publicação interrompida para evitar alterações indevidas.');
}
const newPanel = `<figure class="intro-panel">
<img src="https://images.pexels.com/photos/7031617/pexels-photo-7031617.jpeg?auto=compress&cs=tinysrgb&w=960" alt="Fotografia de referência de cozinha contemporânea com armários de madeira" loading="lazy" decoding="async">
<figcaption>Inspiração de ambiente planejado. Não é um projeto executado pela Vorela.</figcaption>
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
console.log(`Vorela: duas fotos de referência sem crédito obrigatório; ${links} links de WhatsApp configurados; site estático gerado.`);
