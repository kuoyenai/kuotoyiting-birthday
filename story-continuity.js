(()=>{'use strict';
const key='yiting-collection-return';const read=()=>{try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}};
const grid=document.getElementById('cards');
if(grid){
 const save=asset=>{try{sessionStorage.setItem(key,JSON.stringify({series:document.querySelector('.series-cover[aria-pressed="true"]')?.dataset.series||'all',filter:document.querySelector('.card-filters [aria-pressed="true"]')?.textContent||'全部',asset,y:scrollY,flipped:!!document.querySelector('[data-card-asset="'+asset+'"] .flipped')}));}catch{}};
 // Capture the card context even when the shared music shell handles navigation.
 window.addEventListener('click',e=>{const a=e.target.closest('.card-story-link,.gallery-story');if(!a)return;const item=a.closest('.card-item');const image=document.getElementById('cardViewerImage');const asset=item?.dataset.cardAsset||image?.getAttribute('src')?.split('/').pop().replace('.webp','');if(asset)save(asset);},true);
 if(location.hash==='#cards'){const state=read();if(state){document.querySelector('.series-cover[data-series="'+state.series+'"]')?.click();[...document.querySelectorAll('.card-filters button')].find(b=>b.textContent===state.filter)?.click();const target=[...grid.children].find(n=>n.dataset.cardAsset===state.asset);if(state.flipped&&!target?.querySelector('.flipped'))target?.querySelector('.photocard')?.click();requestAnimationFrame(()=>{if(target&&!target.hidden)target.scrollIntoView({block:'center',behavior:'instant'});else scrollTo(0,state.y||0);});}}
}
const pages=document.getElementById('panels')||document.getElementById('sheet');if(!pages)return;
if(read()&&document.getElementById('panels')){const back=document.createElement('a');back.className='collection-return';back.href='gift.html#cards';back.textContent='回到剛才的小卡收藏';document.querySelector('.chapter')?.before(back);}
let preloadGeneration=0;const warm=new Map();
function prepare(){pages.querySelectorAll('img').forEach(img=>{if(img.dataset.continuityReady)return;img.dataset.continuityReady='true';img.decoding='async';img.closest('.art')?.style.setProperty('overflow','hidden','important');const ready=()=>{img.classList.remove('reading-art-pending');img.classList.add('reading-art-ready');};if(img.complete){ready();return;}img.classList.add('reading-art-pending');img.addEventListener('load',ready,{once:true});img.addEventListener('error',ready,{once:true});});
 const generation=++preloadGeneration;const chapter=Number(document.body.dataset.storyChapter);if(!window.NOVEL_PANELS||navigator.connection?.saveData)return;
 const next=window.NOVEL_PANELS[chapter+1]?.slice(0,2)||[];
 const prefetch=()=>{if(generation!==preloadGeneration)return;next.forEach(([asset])=>{const src='assets/'+asset+'.webp';if(warm.has(src))return;const image=new Image();image.decoding='async';image.src=src;warm.set(src,image);});while(warm.size>6)warm.delete(warm.keys().next().value);};
 if('requestIdleCallback'in window)requestIdleCallback(prefetch,{timeout:1500});else setTimeout(prefetch,600);
}
prepare();new MutationObserver(prepare).observe(pages,{childList:true});
})();