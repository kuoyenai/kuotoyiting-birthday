(()=>{
const colors={'藝俊':'#477caa','諾亞':'#9274ad','斑比':'#b76889','河玟':'#638c75','銀虎':'#ab4c63'};
const quiet=new Set(['novel-invitation-closeup-v2','novel-red-star','novel-candle-closeup']);
function refine(){document.querySelectorAll('#panels>.panel,#sheet>.panel').forEach(panel=>{
if(panel.dataset.editorialReady)return;panel.dataset.editorialReady='true';const image=panel.querySelector('img'),asset=image?.getAttribute('src')?.split('/').pop().replace('.webp','');
panel.querySelectorAll('.bubble strong,.bubble>span').forEach(name=>{const member=Object.keys(colors).find(x=>name.textContent.includes(x));if(member){name.classList.add('speaker-name');name.style.setProperty('--speaker-color',colors[member]);}});
if(quiet.has(asset)){
panel.classList.add('quiet-moment');const copy=panel.querySelector('.panel-copy');if(copy){const first=copy.querySelector('.bubble')||copy.querySelector('.panel-narration');const more=document.createElement('details');more.className='quiet-context';const summary=document.createElement('summary');summary.textContent='讀這一刻的旁白';more.append(summary);[...copy.children].forEach(node=>{if(node!==first)more.append(node);});copy.replaceChildren();if(first)copy.append(first);if(more.children.length>1)copy.append(more);}
}else if(panel.querySelector('.bubble'))panel.classList.add('dialogue-spread');
});}
refine();for(const id of ['panels','sheet']){const node=document.getElementById(id);if(node)new MutationObserver(refine).observe(node,{childList:true});}
function plainViewerActions(){document.querySelectorAll('#cardViewer a,#cardViewer button,#imageViewer a,.reading-viewer a,.reading-viewer button').forEach(node=>{if(node.childElementCount)return;const text=node.textContent.replace(/[↗↓✕]/g,'').trim();if(text!==node.textContent)node.textContent=text;});}plainViewerActions();for(const id of ['cardViewer','imageViewer']){const viewer=document.getElementById(id);if(viewer)new MutationObserver(plainViewerActions).observe(viewer,{childList:true,subtree:true});}
const toast=document.createElement('div');toast.className='collection-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast);let timer;
window.yitingFavoriteFeedback=(button,added)=>{clearTimeout(timer);toast.textContent=added?'已收進收藏冊':'已從收藏冊移除';toast.classList.add('visible');timer=setTimeout(()=>toast.classList.remove('visible'),2200);if(added&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const rect=button.getBoundingClientRect();const light=document.createElement('span');light.className='collection-spark';light.style.left=(rect.left+rect.width/2)+'px';light.style.top=(rect.top+rect.height/2)+'px';document.body.append(light);light.addEventListener('animationend',()=>light.remove(),{once:true});}};
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.photocard').forEach(card=>{const sheen=document.createElement('span');sheen.className='card-paper-sheen';sheen.setAttribute('aria-hidden','true');card.append(sheen);});
document.addEventListener('click',event=>{const card=event.target.closest('.photocard');if(!card||reducedMotion.matches)return;card.classList.remove('paper-turn');void card.offsetWidth;card.classList.add('paper-turn');});
document.addEventListener('animationend',event=>{if(event.animationName==='card-paper-light')event.target.closest('.photocard')?.classList.remove('paper-turn');});
})();