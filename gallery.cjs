// Pós-processamento estático da página pública: somente os quatro cartões de ambientes.
// Não altera /sistema, autenticação, dados comerciais ou o WhatsApp.
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const galleries = [
  {title:'Cozinhas',id:'cozinhas',photos:[8143944,6265836,6301168]},
  {title:'Dormitórios',id:'dormitorios',photos:[7535008,6758770,7535012]},
  {title:'Salas e painéis',id:'salas',photos:[6636297,6527053,6265834]},
  {title:'Closets',id:'closets',photos:[6587839,6585745,6580406]}
];
// Fotografias temporárias do Pexels. Páginas de origem/licença são mantidas aqui, não na interface:
// https://www.pexels.com/license/
// https://www.pexels.com/photo/wooden-cabinets-in-the-modern-kitchen-8143944/
// https://www.pexels.com/photo/interior-of-kitchen-with-modern-furniture-and-appliances-6265836/
// https://www.pexels.com/photo/interior-of-kitchen-with-modern-furniture-6301168/
// https://www.pexels.com/photo/interior-of-modern-bedroom-with-bed-built-in-wardrobe-7535008/
// https://www.pexels.com/photo/modern-bedroom-with-table-next-to-bed-and-wardrobe-6758770/
// https://www.pexels.com/photo/interior-of-bedroom-with-built-in-wardrobe-and-padded-stool-7535012/
// https://www.pexels.com/photo/interior-of-modern-living-room-with-tv-on-wall-6636297/
// https://www.pexels.com/photo/modern-furniture-and-tv-set-in-cozy-living-room-6527053/
// https://www.pexels.com/photo/interior-of-stylish-living-room-with-tv-set-on-wall-6265834/
// https://www.pexels.com/photo/empty-shelves-of-modern-wardrobe-at-home-6587839/
// https://www.pexels.com/photo/wardrobe-interior-with-shelves-near-door-6585745/
// https://www.pexels.com/photo/black-and-brown-empty-wardrobe-6580406/
const escape = str => str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const cards = galleries.map((g,i)=>`<article class="room gallery-card" data-gallery="${g.id}" aria-label="Galeria de ${escape(g.title)}">
 <div class="gallery-viewport"><div class="gallery-track">${g.photos.map((id,j)=>`<img src="https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=900" alt="Inspiração de ${escape(g.title.toLowerCase())}, imagem ${j+1} de 3" ${j===0?'loading="lazy"':'loading="lazy"'} decoding="async" draggable="false" width="900" height="600">`).join('')}</div></div>
 <div class="gallery-overlay"><span class="gallery-label">0${i+1} / AMBIENTES</span><h3>${escape(g.title)}</h3><span class="gallery-count" aria-live="polite">01 / 03</span></div>
 <button class="gallery-arrow prev" type="button" data-slide="-1" aria-label="Foto anterior de ${escape(g.title)}">&#8249;</button>
 <button class="gallery-arrow next" type="button" data-slide="1" aria-label="Próxima foto de ${escape(g.title)}">&#8250;</button>
 <div class="gallery-dots" aria-hidden="true"><span class="active"></span><span></span><span></span></div>
</article>`).join('');
const rooms = /<div class="rooms">(?:<article class="room">[\s\S]*?<\/article>){4}<\/div>/;
if ((html.match(/<div class="rooms">/g)||[]).length!==1 || !rooms.test(html)) {
  throw new Error('Grade original de quatro ambientes inesperada. Não publicar para evitar regressões.');
}
html = html.replace(rooms, `<div class="rooms">${cards}</div>`);
const css = `<style>
/* Galerias fotográficas responsivas, independentes do CSS antigo da página. */
.rooms .gallery-card{position:relative;display:block;padding:0;min-width:0;min-height:0;aspect-ratio:1.38/1;overflow:hidden;background:#b9b2a6;isolation:isolate}
.gallery-viewport,.gallery-track{position:absolute;inset:0;width:100%;height:100%}
.gallery-viewport{overflow:hidden}.gallery-track{display:flex;transition:transform .36s ease;will-change:transform}
.gallery-track img{width:100%;height:100%;flex:0 0 100%;object-fit:cover;display:block;user-select:none}
.gallery-overlay{pointer-events:none;position:absolute;inset:auto 0 0;z-index:2;min-height:50%;padding:70px 26px 30px;color:#fff;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;background:linear-gradient(transparent,rgba(11,21,16,.83))}
.gallery-overlay .gallery-label{font-size:10px;letter-spacing:.15em;color:#fff}.gallery-overlay h3{font:normal clamp(27px,3vw,39px)/1.12 Georgia,serif;color:#fff;margin:10px 0 0;overflow-wrap:break-word}
.gallery-overlay .gallery-count{font:11px Arial,sans-serif;letter-spacing:.12em;color:#fff;margin-top:9px}
.gallery-arrow{position:absolute;top:47%;z-index:3;transform:translateY(-50%);width:43px;height:43px;display:grid;place-items:center;background:rgba(247,246,241,.94);color:#25362d;border:0;border-radius:50%;font-size:32px;line-height:1;padding:0;box-shadow:0 2px 15px #0003}
.gallery-arrow.prev{left:13px}.gallery-arrow.next{right:13px}.gallery-arrow:hover{background:#fff}.gallery-arrow:focus-visible{outline:3px solid #a9d9b8;outline-offset:3px}
.gallery-dots{position:absolute;right:21px;bottom:26px;z-index:3;display:flex;gap:6px}.gallery-dots span{width:6px;height:6px;border-radius:100%;background:#ffffff66}.gallery-dots span.active{background:#fff;width:17px;border-radius:5px}
@media(max-width:720px){.rooms .gallery-card{aspect-ratio:1.14/1;min-height:0!important;padding:0!important}.gallery-overlay{padding:55px 19px 20px}.gallery-overlay h3{font-size:clamp(27px,8vw,34px)!important;overflow-wrap:normal}.gallery-dots{right:18px;bottom:21px}.gallery-arrow{width:42px;height:42px}}
@media(prefers-reduced-motion:reduce){.gallery-track{transition:none}}
</style>`;
if(!html.includes('</head>')||!html.includes('</body>')) throw new Error('HTML de publicação incompleto.');
html=html.replace('</head>', css+'\n</head>');
const js=`<script>
// Cada cartão guarda sua própria posição; setas não mudam os outros cartões.
document.querySelectorAll('[data-gallery]').forEach(function(card){
  const images=card.querySelectorAll('.gallery-track img');
  const dots=card.querySelectorAll('.gallery-dots span');
  const count=card.querySelector('.gallery-count');
  const track=card.querySelector('.gallery-track');
  let current=0;
  function show(index){current=(index+images.length)%images.length;track.style.transform='translateX(-'+current*100+'%)';count.textContent=String(current+1).padStart(2,'0')+' / 03';dots.forEach((dot,i)=>dot.classList.toggle('active',i===current));}
  card.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>show(current+Number(button.dataset.slide))));
  let startX=null;
  card.querySelector('.gallery-viewport').addEventListener('touchstart',e=>{startX=e.changedTouches[0]?.screenX??null},{passive:true});
  card.querySelector('.gallery-viewport').addEventListener('touchend',e=>{if(startX===null)return;const delta=(e.changedTouches[0]?.screenX??startX)-startX;if(Math.abs(delta)>55)show(current+(delta<0?1:-1));startX=null},{passive:true});
});
</script>`;
html=html.replace('</body>',js+'\n</body>');
fs.writeFileSync(file,html,'utf8');
console.log('Vorela: quatro cards com três fotografias e controles independentes adicionados ao HTML estático.');
